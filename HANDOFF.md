# HANDOFF — AI Agent Benchmark Dashboard

Drop this file in the repo root. Claude Code: read it fully before writing code.

---

## 0. What you're building

A single, dense, dark web dashboard that aggregates AI agent + model benchmark results across many categories into one digestible interface. No backend. Data lives in one JSON file. A daily GitHub Action calls the Anthropic API to refresh that JSON. Deployed on Vercel, auto-deploying from GitHub.

The differentiator is a **trust layer**: every benchmark is flagged for saturation, contamination, scaffold-dependence, and vendor-vs-independent sourcing. Aggregators disagree; this dashboard makes the disagreement visible instead of hiding it.

---

## 1. Skills to invoke (do not hand-roll defaults)

Use these Claude Code skills for the build:

1. **UX/UI Pro Max** — information architecture, layout density, interaction patterns, table/filter UX.
2. **Anthropic Frontend** — component styling, design system, visual polish.
3. **[SKILL 3 — the user will name this in the Claude Code chat]** — apply per the user's instruction.

If skills conflict, prefer the user's explicit chat instructions, then Anthropic Frontend for visual decisions, then UX/UI Pro Max for structure.

---

## 2. Tech stack (fixed)

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- Data: static `/data/benchmarks.json` (no DB, no server routes for reads)
- Charts: lightweight (Recharts or similar) — only where a chart beats a table
- Deploy: **Vercel** (import from GitHub → auto-deploy on push to default branch)
- Refresh: **GitHub Actions** cron (daily) → `scripts/update.ts` → Anthropic API → rewrite JSON → auto-commit

No user-facing AI calls. The only Anthropic API use is the background refresh script. Keep the site fully static/SSG so it stays free and fast.

---

## 3. Data model

`/data/benchmarks.json` is an object: `{ "meta": {...}, "models": [...], "benchmarks": [...], "scores": [...] }`.

### `benchmark` object
```ts
{
  id: string,                 // "swe-bench-verified"
  name: string,               // "SWE-bench Verified"
  category: Category,         // see §4
  measures: string,           // one-line: what capability it tests
  taskCount: number | null,
  liveOrStatic: "live" | "static",
  contaminationResistant: boolean,
  scaffold: "model" | "system" | "mixed",  // does score reflect base model or full agent
  maintainer: string,         // "Princeton", "Scale/SEAL", "Steel", ...
  sourceUrl: string,
  humanBaseline: number | null,  // % if known
  saturated: boolean,         // top scores clustered, differences meaningless
  flags: Flag[],              // ["saturated","contaminated","scaffold-dependent","vendor-reported","independent"]
  lastUpdated: string         // ISO date
}
```

### `model` object
```ts
{ id: string, name: string, vendor: string, openWeights: boolean, notes: string | null }
```

### `score` object (join row)
```ts
{
  benchmarkId: string,
  modelId: string,
  score: number,             // %
  rank: number | null,
  source: "vendor" | "independent",
  sourceUrl: string,
  asOf: string               // ISO date
}
```

Keep models, benchmarks, and scores normalized so one model can be shown across all benchmarks and one benchmark across all models without duplication.

---

## 4. Categories + benchmarks (seed the JSON with these)

Types: **Category** = one of the headers below. Seed with real, current entries; the refresh script keeps them fresh.

### Coding / Software Engineering
- SWE-bench Verified — 500 human-validated Python GitHub-issue tasks. Scaffold: system. Contamination: **known issue** (flag it).
- SWE-bench Pro — harder, larger commercial-style codebases. Contamination-resistant.
- SWE-bench Multilingual — cross-language variant.
- Terminal-Bench v2 (2.1 board) — end-to-end terminal tasks; scores the agent+model pair.
- Aider Polyglot — 225 hard Exercism tasks across 6 languages.
- LiveCodeBench Pro — contamination-resistant, fresh competitive-programming problems.
- DeepSWE — part of Artificial Analysis coding index.
- SEAL / SWE-bench Pro on Scale — identical harness, 250-turn limit; exposes scaffold gap.
- ProjDevBench — end-to-end project development; multi-turn, high token count. Snapshot only.

### Browser Agents
- WebArena — 812 tasks on reproducible self-hosted sites.
- WebVoyager — 643 tasks on 15 live real-world sites.
- BrowseComp — 1,266 hard agentic web-research questions (OpenAI).

### Computer Use
- OSWorld — real OS/GUI task completion.
- Computer-use splits — vendor computer-use evals (flag vendor-reported).

### Tool Use / Orchestration
- GAIA — general-assistant tasks; scaffold-sensitive (note the scaffold).
- τ²-Bench (tau-2) — conversational, dual-control tool use.
- AgentBench — 8 environments (Tsinghua THUDM); aggregate hides per-env failures.
- MCP Atlas — controlled harness, real tools.
- Agent Arena — live tool-orchestration ranking from real sessions.

### Reasoning / Knowledge
- GPQA Diamond — ~198 PhD-level science questions, search-resistant.
- Humanity's Last Exam (HLE) — 2,500 frontier questions; big human-vs-AI gap.
- MMLU-Pro — broad knowledge; **saturated** at the top (flag it).

### Math
- AIME — competition math.
- USAMO — olympiad-level proofs.

### Multimodal
- MMMU-Pro — multimodal reasoning.
- CharXiv — chart/figure understanding.

### Knowledge Work
- GDPval — win/tie vs 14+ yr human experts; the honest "can it replace the work" signal.

### Deep Research
- DRACO — Perplexity's deep-research benchmark, 100 tasks / 10 domains, expert-graded.
- BrowseComp — (also cross-listed under browser).

### Meta Indexes (aggregators to link + cite, not re-rank)
- Artificial Analysis — composite indexes, cost/speed.
- LLM-Stats — 300+ models by intelligence/speed/price.
- LMArena / Agent Arena — human-preference and agentic session rankings.

---

## 5. Views / pages

1. **Overview** (`/`) — hero with meta ("no single model wins everything; scores vary by harness"), category tiles, and a "leader per benchmark" strip.
2. **By Benchmark** (`/benchmarks`) — card per benchmark: measures, task count, leader+score, human baseline, maintainer, source link, all trust flags. Filter by category, contamination-resistant only, live-only, independent-only.
3. **By Model** (`/models/[id]`) — one model's scores across every benchmark, with source tags.
4. **Master Table** (`/table`) — every score row, sortable by any column, global filter. Dense, monospace numerics.
5. **Methodology** (`/methodology`) — plain-English glossary of each flag and why aggregators disagree.

---

## 6. Trust layer (the differentiator)

Render on every benchmark card and as table badges:
- ⚠️ **Saturated** — top scores clustered; differences ~noise.
- ⚠️ **Contaminated** — known eval-set leakage.
- ⚠️ **Scaffold-dependent** — score reflects the harness as much as the model.
- 🏷️ **Vendor-reported** vs ✅ **Independent** — always label the source.

Provide a global filter: "Show only contamination-resistant + independent." This is the honest view.

---

## 7. File structure

```
/
├─ HANDOFF.md
├─ data/
│  └─ benchmarks.json
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                 // Overview
│  ├─ benchmarks/page.tsx
│  ├─ models/[id]/page.tsx
│  ├─ table/page.tsx
│  └─ methodology/page.tsx
├─ components/
│  ├─ BenchmarkCard.tsx
│  ├─ ScoreTable.tsx
│  ├─ Filters.tsx
│  ├─ TrustBadge.tsx
│  └─ CategoryTile.tsx
├─ lib/
│  ├─ data.ts                  // load + type the JSON
│  └─ types.ts
├─ scripts/
│  └─ update.ts                // Anthropic refresh (see §8)
├─ .github/workflows/
│  └─ update.yml               // daily cron (see §9)
├─ tailwind.config.ts
├─ package.json
└─ README.md
```

---

## 8. Update script spec (`scripts/update.ts`)

Purpose: once daily, refresh scores/leaders/flags in `benchmarks.json`.

- Read `ANTHROPIC_API_KEY` from env.
- For each source/aggregator, ask Claude to extract current leader + score + as-of date into the strict `score` schema (§3). Prompt Claude to return **JSON only**, no prose. Parse defensively, strip code fences.
- Merge into existing JSON: update scores + `lastUpdated`, never drop benchmark definitions.
- Preserve manual overrides: any benchmark with `"locked": true` is skipped by the script.
- Write the file; exit 0 even if some sources fail (partial update is fine).
- Log a short summary of what changed.

Keep token use tiny: one focused call per source, cheap model, no retries storms. Target well under a few cents/run.

---

## 9. GitHub Action (`.github/workflows/update.yml`)

```yaml
name: Update benchmarks
on:
  schedule:
    - cron: '0 6 * * *'    # daily 06:00 UTC
  workflow_dispatch:        # manual run button
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx tsx scripts/update.ts
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - run: |
          git config user.name "benchmark-bot"
          git config user.email "bot@users.noreply.github.com"
          git add -A
          git commit -m "chore: daily benchmark refresh" || exit 0
          git push
```

Note: scheduled Actions run only on the **default branch**. Merge to it before expecting the cron to fire.

---

## 10. Design direction

- Dark, high-density, data-first. Think a terminal/observability panel, not a marketing page.
- Monospace for numbers; tabular alignment; compact row height.
- Color: neutral base, one accent, semantic colors only for trust flags (amber = warning, green = independent/verified).
- Fast scanning: sticky table headers, sortable columns, instant client-side filter.
- No hero fluff beyond the one honest caveat line.
- Accessible contrast; keyboard-navigable table and filters.
- Apply the Anthropic Frontend skill for the component system and the UX/UI Pro Max skill for layout/interaction. Fold in the user's third skill where they direct.

---

## 11. Setup steps (human)

1. `npm install`, confirm `npm run dev` renders with seed JSON.
2. GitHub → Settings → Secrets and variables → Actions → New secret: `ANTHROPIC_API_KEY`.
3. Push to the default branch.
4. Vercel → New Project → import the repo → deploy (framework auto-detected).
5. Trigger the Action once via **Run workflow** to confirm the refresh commits cleanly.

---

## 12. Acceptance checklist

- [ ] Loads fully static; no key needed to view.
- [ ] All categories in §4 present and filterable.
- [ ] Every benchmark card shows measures, leader, score, human baseline, maintainer, source link, trust flags.
- [ ] Master table sorts by any column + global filter.
- [ ] By-Model view aggregates one model across all benchmarks.
- [ ] "Contamination-resistant + independent only" filter works.
- [ ] GitHub Action runs, commits, Vercel redeploys.
- [ ] `locked: true` benchmarks are not overwritten.
