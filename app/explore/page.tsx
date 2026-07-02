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
        <h1
          className="load-in text-2xl font-semibold tracking-tight text-fg"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          Explore the data
        </h1>
        <p
          className="load-in mt-1 text-sm text-muted"
          style={{ "--d": "60ms" } as React.CSSProperties}
        >
          The raw material behind the charts.
        </p>
      </div>
      <ExploreBrowser />
    </div>
  );
}
