"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { benchmarks } from "@/lib/data";
import { CATEGORIES } from "@/lib/types";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import {
  Filters,
  DEFAULT_FILTERS,
  type BenchmarkFilterState,
} from "@/components/Filters";

export function BenchmarksBrowser() {
  // Deep-link category via ?category= (set by the overview tiles). Read on the
  // client so the page stays statically prerendered.
  const params = useSearchParams();
  const raw = params.get("category") ?? "";
  const initialCategory = (CATEGORIES as string[]).includes(raw) ? raw : "";

  const [filters, setFilters] = useState<BenchmarkFilterState>({
    ...DEFAULT_FILTERS,
    category: initialCategory,
  });

  const results = useMemo(
    () =>
      benchmarks.filter((b) => {
        if (filters.category && b.category !== filters.category) return false;
        if (filters.contaminationResistant && !b.contaminationResistant) return false;
        if (filters.live && b.liveOrStatic !== "live") return false;
        if (filters.independent && !b.flags.includes("independent")) return false;
        return true;
      }),
    [filters],
  );

  return (
    <div>
      <Filters
        categories={CATEGORIES}
        value={filters}
        onChange={setFilters}
        resultCount={results.length}
        total={benchmarks.length}
      />

      {results.length === 0 ? (
        <div className="mt-16 rounded-lg border border-dashed border-line-strong bg-surface p-10 text-center">
          <p className="text-sm font-medium text-fg">No benchmarks match these filters.</p>
          <p className="mt-1 text-xs text-muted">
            The honest view is strict on purpose. Loosen a toggle to see more.
          </p>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-4 rounded-md border border-line px-3 py-1.5 text-xs text-fg hover:border-line-strong"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((b) => (
            <BenchmarkCard key={b.id} benchmark={b} />
          ))}
        </div>
      )}
    </div>
  );
}
