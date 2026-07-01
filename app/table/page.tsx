import type { Metadata } from "next";
import { ScoreTable } from "@/components/ScoreTable";
import { scoreRows } from "@/lib/data";

export const metadata: Metadata = {
  title: "Master table",
  description:
    "Every score row: benchmark, model, vendor, score, rank, source, and date. Sortable by any column with a global filter.",
};

export default function TablePage() {
  const rows = scoreRows();
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Master table</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Every score row across every benchmark. Sort any column; filter
          globally. Numbers are monospaced and tabular so columns line up.
          Values above 100 are Elo ratings, not percentages.
        </p>
      </div>
      <ScoreTable rows={rows} />
    </div>
  );
}
