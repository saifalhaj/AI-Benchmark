"use client";

import { useState } from "react";
import { BenchmarksBrowser } from "@/components/BenchmarksBrowser";
import { ScoreTable } from "@/components/ScoreTable";
import { scoreRows } from "@/lib/data";

type View = "cards" | "table";

// One tab for all the raw data: benchmark cards with trust filters, or the
// full sortable score table, behind a segmented toggle.
export function ExploreBrowser() {
  const [view, setView] = useState<View>("cards");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Data view"
        className="mb-4 inline-flex rounded-md border border-line bg-surface p-0.5"
      >
        {(
          [
            { key: "cards", label: "Benchmark cards" },
            { key: "table", label: "Master table" },
          ] as { key: View; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={view === t.key}
            onClick={() => setView(t.key)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              view === t.key
                ? "bg-elevated text-fg"
                : "text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "cards" ? <BenchmarksBrowser /> : <ScoreTable rows={scoreRows()} />}
    </div>
  );
}
