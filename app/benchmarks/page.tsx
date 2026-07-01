import type { Metadata } from "next";
import { Suspense } from "react";
import { BenchmarksBrowser } from "@/components/BenchmarksBrowser";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "Every benchmark with its measures, leader, human baseline, maintainer, source, and trust flags. Filter to the honest view.",
};

export default function BenchmarksPage() {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Benchmarks</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          One card per benchmark: what it measures, who leads, the human
          baseline, and every trust flag. Use the honest view to drop
          contaminated and vendor-only results.
        </p>
      </div>
      <Suspense fallback={null}>
        <BenchmarksBrowser />
      </Suspense>
    </div>
  );
}
