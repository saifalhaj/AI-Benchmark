import Link from "next/link";
import type { Benchmark } from "@/lib/types";
import { scoresForBenchmark, getModel, formatScore, isPercent } from "@/lib/data";
import { TrustStrip, SourceBadge } from "@/components/TrustBadge";

export function BenchmarkCard({ benchmark }: { benchmark: Benchmark }) {
  const rows = scoresForBenchmark(benchmark.id).slice(0, 4);
  const top = rows[0];
  const showBars = top ? isPercent(top.score) : false;

  return (
    <article className="flex flex-col rounded-lg border border-line bg-surface p-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xs font-mono uppercase tracking-wide text-faint">
            {benchmark.category}
          </p>
          <h3 className="mt-1 text-base font-semibold text-fg">{benchmark.name}</h3>
        </div>
        {top && (
          <div className="shrink-0 text-right">
            <div className="tnum font-mono text-xl font-semibold text-fg">
              {formatScore(top.score)}
            </div>
            <div className="text-2xs text-faint">leader</div>
          </div>
        )}
      </header>

      <p className="mt-3 text-sm leading-relaxed text-muted">{benchmark.measures}</p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-2xs">
        <div className="flex justify-between border-b border-line/60 pb-1">
          <dt className="text-faint">Tasks</dt>
          <dd className="tnum font-mono text-muted">
            {benchmark.taskCount?.toLocaleString() ?? "n/a"}
          </dd>
        </div>
        <div className="flex justify-between border-b border-line/60 pb-1">
          <dt className="text-faint">Human baseline</dt>
          <dd className="tnum font-mono text-muted">
            {benchmark.humanBaseline != null ? `${benchmark.humanBaseline}%` : "n/a"}
          </dd>
        </div>
        <div className="col-span-2 flex justify-between border-b border-line/60 pb-1">
          <dt className="text-faint">Maintainer</dt>
          <dd className="text-muted">{benchmark.maintainer}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2">
        {rows.map((s) => {
          const model = getModel(s.modelId);
          return (
            <div key={s.modelId} className="flex items-center gap-3">
              <span className="tnum w-4 shrink-0 text-right font-mono text-2xs text-faint">
                {s.rank ?? "·"}
              </span>
              <Link
                href={`/models/${s.modelId}`}
                className="w-24 shrink-0 truncate text-xs text-fg hover:text-accent sm:w-32"
              >
                {model?.name ?? s.modelId}
              </Link>
              <div className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-elevated sm:block">
                {showBars && (
                  <div
                    className="h-full rounded-full bg-accent/70"
                    style={{ width: `${Math.min(100, s.score)}%` }}
                  />
                )}
              </div>
              <span className="flex-1 sm:hidden" aria-hidden />
              <span className="tnum w-14 shrink-0 text-right font-mono text-xs text-fg">
                {formatScore(s.score)}
              </span>
              <SourceBadge source={s.source} />
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <TrustStrip benchmark={benchmark} />
      </div>

      <footer className="mt-4 flex items-center justify-between text-2xs text-faint">
        <a
          href={benchmark.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Source ↗
        </a>
        <span className="tnum font-mono">Updated {benchmark.lastUpdated}</span>
      </footer>
    </article>
  );
}
