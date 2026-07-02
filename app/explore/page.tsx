import type { Metadata } from "next";
import { ExploreBrowser } from "@/components/ExploreBrowser";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Every benchmark and every score row: trust-flagged cards or the full sortable master table, with the honest-view filter.",
};

export default function ExplorePage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Explore the data</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          The raw material behind the charts. Benchmark cards carry every trust
          flag; the master table holds every score row, sortable by any column.
        </p>
      </div>
      <ExploreBrowser />
    </div>
  );
}
