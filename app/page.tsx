import Link from "next/link";
import { ScoreMatrix } from "@/components/viz/ScoreMatrix";
import { CategoryFingerprints } from "@/components/viz/CategoryFingerprints";
import {
  meta,
  benchmarks,
  models,
  byCategory,
  leaderFor,
} from "@/lib/data";

// Count rank-1 finishes per model — the quantified thesis: no single model
// leads everywhere.
function winsByModel() {
  const wins = new Map<string, { name: string; count: number; benches: string[] }>();
  for (const b of benchmarks) {
    const l = leaderFor(b.id);
    if (!l?.model) continue;
    const cur = wins.get(l.model.id) ?? { name: l.model.name, count: 0, benches: [] };
    cur.count += 1;
    cur.benches.push(b.name);
    wins.set(l.model.id, cur);
  }
  return [...wins.values()].sort((a, b) => b.count - a.count);
}

export default function AtlasPage() {
  const wins = winsByModel();
  const maxWins = Math.max(...wins.map((w) => w.count), 1);
  const groups = byCategory();

  return (
    <div className="space-y-16">
      {/* Hero — the caveat IS the thesis */}
      <section className="animate-fade-up">
        <p className="text-2xs font-mono uppercase tracking-[0.2em] text-faint">
          AI agent + model benchmarks · trust layer
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-fg md:text-6xl">
          No model wins everything.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          {meta.caveat}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/trust"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-accent-dim"
          >
            See the trust layer
          </Link>
          <Link
            href="/explore"
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-line-strong"
          >
            Explore the data
          </Link>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
          {[
            { k: "Benchmarks", v: benchmarks.length },
            { k: "Categories", v: groups.length },
            { k: "Models tracked", v: models.length },
            { k: "Distinct leaders", v: wins.length },
          ].map((s) => (
            <div key={s.k} className="bg-surface px-4 py-4">
              <dt className="text-2xs uppercase tracking-wide text-faint">{s.k}</dt>
              <dd className="tnum mt-1 font-mono text-2xl font-semibold text-fg">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Signature: the whole field in one matrix */}
      <section>
        <h2 className="text-lg font-semibold text-fg">The whole field at once</h2>
        <p className="mt-1 max-w-2xl text-xs text-muted">
          Every score on the site in one matrix. Color intensity is relative
          within each row, so each benchmark sets its own scale. Click a model
          to isolate its column; hover any cell for the full record.
        </p>
        <div className="mt-5">
          <ScoreMatrix />
        </div>
      </section>

      {/* Who leads where */}
      <section>
        <h2 className="text-lg font-semibold text-fg">Who leads where</h2>
        <p className="mt-1 text-xs text-muted">
          Rank-1 finishes across {benchmarks.length} benchmarks. The spread is the point.
        </p>
        <div className="mt-5 space-y-2.5">
          {wins.map((w) => (
            <div key={w.name} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-xs text-fg sm:w-40">
                {w.name}
              </span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-surface">
                <div
                  className="flex h-full items-center rounded bg-accent/25 pl-2 ring-1 ring-inset ring-accent/30"
                  style={{ width: `${(w.count / maxWins) * 100}%` }}
                >
                  <span className="tnum font-mono text-2xs text-accent">{w.count}</span>
                </div>
              </div>
              <span className="hidden w-56 shrink-0 truncate text-2xs text-faint lg:block">
                {w.benches.slice(0, 3).join(", ")}
                {w.benches.length > 3 ? "…" : ""}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Capability fingerprints */}
      <section>
        <h2 className="text-lg font-semibold text-fg">Every model has a shape</h2>
        <p className="mt-1 max-w-2xl text-xs text-muted">
          Capability fingerprints across all nine categories, normalized within
          each benchmark. Two models with similar averages can have very
          different shapes.
        </p>
        <div className="mt-5">
          <CategoryFingerprints />
        </div>
      </section>

      {/* Sources */}
      <section>
        <h2 className="text-lg font-semibold text-fg">Sources</h2>
        <p className="mt-1 max-w-2xl text-xs text-muted">
          Scraped sources feed the numbers daily. Referenced leaderboards are
          linked, never re-ranked into a false consensus.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meta.dataSources.map((a) => (
            <a
              key={a.name}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-elevated"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-fg">{a.name}</span>
                <span className="inline-flex items-center gap-1.5 rounded border border-ok/40 bg-ok-soft px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide text-ok">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ok" />
                  Scraped daily
                </span>
              </div>
              <p className="mt-2 text-2xs leading-relaxed text-muted">{a.measures}</p>
            </a>
          ))}
          {meta.linkOuts.map((a) => (
            <a
              key={a.name}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-elevated"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-fg">{a.name}</span>
                <span className="rounded border border-line-strong bg-elevated px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide text-muted">
                  Linked only
                </span>
              </div>
              <p className="mt-2 text-2xs leading-relaxed text-muted">{a.measures}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
