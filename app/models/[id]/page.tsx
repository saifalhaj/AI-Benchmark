import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  models,
  getModel,
  getBenchmark,
  scoresForModel,
  formatScore,
} from "@/lib/data";
import { SourceBadge } from "@/components/TrustBadge";

export function generateStaticParams() {
  return models.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const model = getModel(id);
  return {
    title: model ? model.name : "Model",
    description: model
      ? `${model.name} (${model.vendor}) across every tracked benchmark, with source tags.`
      : undefined,
  };
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();

  const rows = scoresForModel(id)
    .map((s) => ({ score: s, benchmark: getBenchmark(s.benchmarkId) }))
    .filter((r) => r.benchmark)
    .sort((a, b) => {
      const cat = a.benchmark!.category.localeCompare(b.benchmark!.category);
      return cat !== 0 ? cat : b.score.score - a.score.score;
    });

  const wins = rows.filter((r) => r.score.rank === 1).length;

  return (
    <div>
      <nav className="mb-6 text-2xs text-faint">
        <Link href="/table" className="hover:text-muted">
          Table
        </Link>{" "}
        <span aria-hidden>/</span> {model.name}
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{model.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {model.vendor}
            {model.notes ? ` · ${model.notes}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span
              className={`rounded border px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide ${
                model.openWeights
                  ? "border-ok/40 bg-ok-soft text-ok"
                  : "border-line-strong bg-elevated text-muted"
              }`}
            >
              {model.openWeights ? "Open weights" : "Closed weights"}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line text-center">
          <div className="bg-surface px-5 py-3">
            <dt className="text-2xs uppercase tracking-wide text-faint">Benchmarks</dt>
            <dd className="tnum mt-1 font-mono text-xl font-semibold text-fg">{rows.length}</dd>
          </div>
          <div className="bg-surface px-5 py-3">
            <dt className="text-2xs uppercase tracking-wide text-faint">Rank-1</dt>
            <dd className="tnum mt-1 font-mono text-xl font-semibold text-fg">{wins}</dd>
          </div>
        </dl>
      </header>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-muted">No scores recorded yet for this model.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-line bg-surface text-faint">
                <th scope="col" className="px-3 py-2 text-left font-medium uppercase tracking-wide">
                  Benchmark
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium uppercase tracking-wide">
                  Category
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium uppercase tracking-wide">
                  Score
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium uppercase tracking-wide">
                  Rank
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium uppercase tracking-wide">
                  Source
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium uppercase tracking-wide">
                  As of
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ score, benchmark }) => (
                <tr
                  key={score.benchmarkId}
                  className="border-b border-line/50 last:border-0 hover:bg-elevated"
                >
                  <td className="whitespace-nowrap px-3 py-1.5">
                    <a
                      href={benchmark!.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg hover:text-accent"
                    >
                      {benchmark!.name}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5 text-muted">
                    {benchmark!.category}
                  </td>
                  <td className="tnum whitespace-nowrap px-3 py-1.5 text-right font-mono font-semibold text-fg">
                    {formatScore(score.score)}
                  </td>
                  <td className="tnum whitespace-nowrap px-3 py-1.5 text-right font-mono text-muted">
                    {score.rank ?? "n/a"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5">
                    <SourceBadge source={score.source} />
                  </td>
                  <td className="tnum whitespace-nowrap px-3 py-1.5 text-right font-mono text-faint">
                    {score.asOf}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
