import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { ScoreMatrix } from "@/components/viz/ScoreMatrix";
import { CategoryFingerprints } from "@/components/viz/CategoryFingerprints";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
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

  const ticker = [
    { v: benchmarks.length, k: "benchmarks" },
    { v: groups.length, k: "categories" },
    { v: models.length, k: "models" },
    { v: wins.length, k: "leaders" },
  ];

  return (
    <div className="space-y-16">
      {/* Hero — the caveat IS the thesis */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 h-72"
          style={{
            background:
              "radial-gradient(ellipse 60% 90% at 50% 0%, rgba(91,155,255,0.07), transparent 65%)",
          }}
        />
        <p
          className="load-in text-2xs font-mono uppercase tracking-[0.2em] text-faint"
          style={{ "--d": "0ms" } as CSSProperties}
        >
          AI agent + model benchmarks · trust layer
        </p>
        <h1
          className="load-in mt-3 max-w-4xl pb-1 text-4xl font-semibold leading-[1.1] tracking-tight text-fg md:text-6xl"
          style={{ "--d": "60ms" } as CSSProperties}
        >
          No model wins <em className="italic">everything</em>.
        </h1>
        <p
          className="load-in mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base"
          style={{ "--d": "140ms" } as CSSProperties}
        >
          {meta.caveat}
        </p>
        <div
          className="load-in mt-6 flex flex-wrap gap-3"
          style={{ "--d": "220ms" } as CSSProperties}
        >
          <Link
            href="/trust"
            className="press rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-accent-dim"
          >
            See the trust layer
          </Link>
          <Link
            href="/explore"
            className="press rounded-md border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-line-strong"
          >
            Explore the data
          </Link>
        </div>

        <div
          className="load-in mt-10 flex flex-wrap items-center gap-x-4 gap-y-2"
          style={{ "--d": "300ms" } as CSSProperties}
        >
          {ticker.map((s, i) => (
            <Fragment key={s.k}>
              {i > 0 && <span aria-hidden className="h-3 w-px bg-line" />}
              <span className="flex items-baseline gap-1.5">
                <CountUp
                  value={s.v}
                  className="tnum font-mono text-lg font-semibold text-fg"
                />
                <span className="text-2xs text-faint">{s.k}</span>
              </span>
            </Fragment>
          ))}
        </div>
      </section>

      {/* Signature: the whole field in one matrix */}
      <section>
        <Reveal>
          <h2 className="rv text-lg font-semibold text-fg">The whole field at once</h2>
          <p
            className="rv mt-1 text-xs text-muted"
            style={{ "--rv-delay": "60ms" } as CSSProperties}
          >
            Every score in one grid. Click a model to isolate it; hover a cell for the record.
          </p>
        </Reveal>
        <div className="mt-5">
          <ScoreMatrix />
        </div>
      </section>

      {/* Who leads where */}
      <section>
        <Reveal>
          <h2 className="rv text-lg font-semibold text-fg">Who leads where</h2>
          <p
            className="rv mt-1 text-xs text-muted"
            style={{ "--rv-delay": "60ms" } as CSSProperties}
          >
            Rank-1 finishes. The spread is the point.
          </p>
        </Reveal>
        <Reveal className="mt-5 space-y-2.5">
          {wins.map((w, i) => (
            <div key={w.name} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-xs text-fg sm:w-40">
                {w.name}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-surface">
                <div
                  className="grow-x absolute inset-y-0 left-0 rounded bg-accent/25 ring-1 ring-inset ring-accent/30"
                  style={
                    {
                      width: `${(w.count / maxWins) * 100}%`,
                      "--rv-delay": `${i * 70}ms`,
                    } as CSSProperties
                  }
                />
                <span
                  className="fade tnum absolute inset-y-0 left-2 flex items-center font-mono text-2xs text-accent"
                  style={{ "--rv-delay": `${i * 70 + 250}ms` } as CSSProperties}
                >
                  {w.count}
                </span>
              </div>
              <span className="hidden w-56 shrink-0 truncate text-2xs text-faint lg:block">
                {w.benches.slice(0, 3).join(", ")}
                {w.benches.length > 3 ? "…" : ""}
              </span>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Capability fingerprints */}
      <section>
        <Reveal>
          <h2 className="rv text-lg font-semibold text-fg">Every model has a shape</h2>
          <p
            className="rv mt-1 text-xs text-muted"
            style={{ "--rv-delay": "60ms" } as CSSProperties}
          >
            Normalized within each benchmark. Similar averages, different shapes.
          </p>
        </Reveal>
        <div className="mt-5">
          <CategoryFingerprints />
        </div>
      </section>

      {/* Sources */}
      <section>
        <Reveal>
          <h2 className="rv text-lg font-semibold text-fg">Sources</h2>
        </Reveal>
        <Reveal className="mt-5">
          <div className="rounded-lg border border-line bg-surface">
            <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-2xs font-mono uppercase tracking-wide text-faint">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-ok" />
              Scraped daily
            </div>
            <div className="divide-y divide-line/60">
              {meta.dataSources.map((a, i) => (
                <a
                  key={a.name}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rv press flex items-center gap-3 px-4 py-2.5 hover:bg-elevated"
                  style={{ "--rv-delay": `${i * 40}ms` } as CSSProperties}
                >
                  <span className="w-44 shrink-0 truncate text-sm font-medium text-fg">
                    {a.name}
                  </span>
                  <span className="hidden flex-1 truncate text-2xs text-muted sm:block">
                    {a.measures}
                  </span>
                  <span className="ml-auto text-2xs text-faint">→</span>
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-2xs font-mono uppercase tracking-wide text-faint">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-line-strong" />
              Linked only
            </div>
            <div className="divide-y divide-line/60">
              {meta.linkOuts.map((a, i) => (
                <a
                  key={a.name}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rv press flex items-center gap-3 px-4 py-2.5 hover:bg-elevated"
                  style={
                    {
                      "--rv-delay": `${(meta.dataSources.length + i) * 40}ms`,
                    } as CSSProperties
                  }
                >
                  <span className="w-44 shrink-0 truncate text-sm font-medium text-fg">
                    {a.name}
                  </span>
                  <span className="hidden flex-1 truncate text-2xs text-muted sm:block">
                    {a.measures}
                  </span>
                  <span className="ml-auto text-2xs text-faint">→</span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
