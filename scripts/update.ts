/**
 * Daily refresh for data/benchmarks.json.
 *
 * Scrapes a fixed set of source leaderboards: fetches each page, hands the
 * cleaned text to Claude, and asks it to return score rows in the existing
 * schema (JSON only). Rows are merged in: benchmark definitions are never
 * dropped, `locked` benchmarks are never touched, and partial failure is fine
 * (the process always exits 0 so one dead source never breaks the workflow).
 *
 * Only this script (run by the GitHub Action) needs ANTHROPIC_API_KEY. The
 * site itself is fully static and never calls the API.
 *
 * Self-check: `tsx scripts/update.ts --selfcheck` runs the pure-function
 * assertions without touching the network or the data file.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const DATA_PATH = resolve(process.cwd(), "data/benchmarks.json");
const MODEL = "claude-haiku-4-5-20251001"; // cheap; one focused call per source
const today = new Date().toISOString().slice(0, 10);
const MAX_PAGE_CHARS = 16000; // keep token use tiny — a few cents per run
const FETCH_TIMEOUT_MS = 20000;

type Score = {
  benchmarkId: string;
  modelId: string;
  score: number;
  rank: number | null;
  source: "vendor" | "independent";
  sourceUrl: string;
  asOf: string;
};
type Benchmark = { id: string; name: string; sourceUrl: string; lastUpdated: string; locked?: boolean };
type Model = { id: string; name: string; vendor: string };
type Data = {
  meta: { lastUpdated: string; [k: string]: unknown };
  models: Model[];
  benchmarks: Benchmark[];
  scores: Score[];
};

// Sources scraped daily. `benchmarkIds` scopes which of our benchmarks a page
// can inform, so Claude only has to map into a short, relevant candidate list.
const SOURCES: { key: string; name: string; url: string; benchmarkIds: string[] }[] = [
  {
    key: "artificial-analysis",
    name: "Artificial Analysis",
    url: "https://artificialanalysis.ai",
    benchmarkIds: ["deepswe", "livecodebench-pro", "gpqa-diamond", "hle", "mmlu-pro", "aime", "mmmu-pro"],
  },
  {
    key: "llm-stats",
    name: "LLM-Stats",
    url: "https://llm-stats.com",
    benchmarkIds: ["gpqa-diamond", "mmlu-pro", "hle", "aime", "mmmu-pro", "livecodebench-pro"],
  },
  {
    key: "steel",
    name: "Steel",
    url: "https://leaderboard.steel.dev",
    benchmarkIds: ["webvoyager", "webarena", "browsecomp", "osworld"],
  },
];

// Strip a raw HTML document down to visible text so the model isn't fed markup.
// ponytail: regex de-tag, not a DOM parser. Good enough for leaderboard text;
// upgrade to a source's JSON API if a page turns out to be fully JS-rendered.
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// Pull the first JSON array out of a model reply (tolerates code fences/prose).
export function extractJsonArray(text: string): unknown[] {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Map a free-text model name back to one of our known ids.
export function matchModel(models: Model[], name: unknown): Model | null {
  if (typeof name !== "string") return null;
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!n) return null;
  for (const m of models) {
    const byId = m.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const byName = m.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (n === byId || n === byName || n.includes(byName) || byName.includes(n)) return m;
  }
  return null;
}

const isIsoDate = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; benchmark-bot/1.0; +https://github.com/saifalhaj/AI-Benchmark)",
      accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return htmlToText(await res.text()).slice(0, MAX_PAGE_CHARS);
}

async function parseSource(
  client: Anthropic,
  source: (typeof SOURCES)[number],
  benchmarks: Benchmark[],
  models: Model[],
  pageText: string,
): Promise<unknown[]> {
  const benchList = benchmarks
    .filter((b) => source.benchmarkIds.includes(b.id))
    .map((b) => `${b.id} = "${b.name}"`)
    .join("; ");
  const roster = models.map((m) => `${m.id} = "${m.name}"`).join("; ");

  const prompt =
    `Below is the visible text of the ${source.name} leaderboard (${source.url}). ` +
    `Extract current model scores and return ONLY a JSON array (no prose, no code fences). ` +
    `Each element: {"benchmarkId":<known id>,"modelId":<known id>,"score":<number>,` +
    `"rank":<number|null>,"asOf":"YYYY-MM-DD"}. ` +
    `Known benchmarks: ${benchList}. Known models: ${roster}. ` +
    `Only include a row when you can confidently match BOTH a known benchmark and a known model. ` +
    `Score is a percentage number (or an Elo/rating where that is what the page reports). ` +
    `If nothing matches, return [].\n\nPAGE TEXT:\n${pageText}`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return extractJsonArray(text);
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log("ANTHROPIC_API_KEY not set - nothing to refresh, exiting cleanly.");
    return;
  }

  const data: Data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  const benchmarkById = new Map(data.benchmarks.map((b) => [b.id, b]));
  const client = new Anthropic({ apiKey });
  const changes: string[] = [];
  let skippedLocked = 0;

  for (const source of SOURCES) {
    try {
      const pageText = await fetchPageText(source.url);
      if (!pageText) {
        console.log(`· ${source.key}: empty page, skipped`);
        continue;
      }
      const rows = await parseSource(client, source, data.benchmarks, data.models, pageText);
      let applied = 0;

      for (const row of rows) {
        const r = row as Record<string, unknown>;
        const bench = benchmarkById.get(String(r.benchmarkId));
        if (!bench || !source.benchmarkIds.includes(bench.id)) continue;
        if (bench.locked) {
          skippedLocked++;
          continue;
        }
        const model = matchModel(data.models, r.modelId);
        const score = Number(r.score);
        if (!model || !Number.isFinite(score)) continue;

        const rank = Number.isFinite(Number(r.rank)) ? Number(r.rank) : null;
        const asOf = isIsoDate(r.asOf) ? r.asOf : today;
        const existing = data.scores.find(
          (s) => s.benchmarkId === bench.id && s.modelId === model.id,
        );

        if (existing) {
          if (existing.score !== score) {
            changes.push(`${bench.id}/${model.id}: ${existing.score} -> ${score} (${source.key})`);
          }
          existing.score = score;
          existing.rank = rank ?? existing.rank;
          existing.source = "independent"; // third-party aggregator, not the vendor
          existing.sourceUrl = source.url;
          existing.asOf = asOf;
        } else {
          data.scores.push({
            benchmarkId: bench.id,
            modelId: model.id,
            score,
            rank,
            source: "independent",
            sourceUrl: source.url,
            asOf,
          });
          changes.push(`${bench.id}/${model.id}: new @ ${score} (${source.key})`);
        }
        bench.lastUpdated = today;
        applied++;
      }
      console.log(`· ${source.key}: ${applied} row(s) applied from ${rows.length} parsed`);
    } catch (err) {
      console.log(`· ${source.key}: error - ${(err as Error).message}`);
    }
  }

  data.meta.lastUpdated = today;
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");

  if (skippedLocked) console.log(`Skipped ${skippedLocked} locked row(s).`);
  console.log(
    changes.length
      ? `Updated ${changes.length} row(s):\n  ${changes.join("\n  ")}`
      : "No score changes; refreshed timestamps only.",
  );
}

// Runnable check for the parsing logic — no network, no API key, no file writes.
function selfCheck() {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`selfcheck failed: ${msg}`);
  };
  assert(
    htmlToText("<div>GPT-5.2 <b>90.4%</b></div><script>x=1</script>") === "GPT-5.2 90.4%",
    "htmlToText strips tags and scripts",
  );
  assert(extractJsonArray('```json\n[{"a":1}]\n```').length === 1, "extractJsonArray reads fenced array");
  assert(extractJsonArray("no json here").length === 0, "extractJsonArray tolerates junk");
  const models: Model[] = [{ id: "gpt-5-2", name: "GPT-5.2", vendor: "OpenAI" }];
  assert(matchModel(models, "GPT-5.2")?.id === "gpt-5-2", "matchModel by name");
  assert(matchModel(models, "gpt 5.2 (high)")?.id === "gpt-5-2", "matchModel fuzzy");
  assert(matchModel(models, "Claude") === null, "matchModel rejects unknown");
  assert(isIsoDate("2026-01-20") && !isIsoDate("Jan 20"), "isIsoDate validates format");
  console.log("selfcheck passed");
}

if (process.argv.includes("--selfcheck")) {
  selfCheck();
} else {
  main().catch((err) => {
    // Partial failure is fine — never fail the workflow over a refresh.
    console.error("Refresh error:", err);
    process.exit(0);
  });
}
