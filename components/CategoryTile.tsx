import Link from "next/link";
import type { Benchmark, Category } from "@/lib/types";
import { leaderFor, formatScore } from "@/lib/data";

// One tile per category on the overview. Shows how many benchmarks it holds
// and which distinct models currently lead inside it — the "disagreement"
// made visible at a glance.
export function CategoryTile({
  category,
  benchmarks,
}: {
  category: Category;
  benchmarks: Benchmark[];
}) {
  const leaders = benchmarks
    .map((b) => leaderFor(b.id)?.model?.name)
    .filter((n): n is string => Boolean(n));
  const distinctLeaders = Array.from(new Set(leaders));

  return (
    <Link
      href={`/benchmarks?category=${encodeURIComponent(category)}`}
      className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-elevated"
    >
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold text-fg">{category}</h3>
          <span className="tnum text-2xs font-mono text-faint">
            {benchmarks.length.toString().padStart(2, "0")}
          </span>
        </div>
        <p className="mt-1 text-2xs text-muted">
          {distinctLeaders.length > 1
            ? `${distinctLeaders.length} different leaders`
            : "single leader"}
        </p>
      </div>

      <div className="mt-4 space-y-1">
        {benchmarks.slice(0, 3).map((b) => {
          const l = leaderFor(b.id);
          return (
            <div key={b.id} className="flex items-center justify-between gap-2 text-2xs">
              <span className="truncate text-muted">{b.name}</span>
              <span className="tnum shrink-0 font-mono text-faint">
                {l ? formatScore(l.score.score) : "n/a"}
              </span>
            </div>
          );
        })}
        {benchmarks.length > 3 && (
          <div className="text-2xs text-faint">
            +{benchmarks.length - 3} more
          </div>
        )}
      </div>

      <span className="mt-4 inline-flex items-center gap-1 text-2xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
        Open benchmarks →
      </span>
    </Link>
  );
}
