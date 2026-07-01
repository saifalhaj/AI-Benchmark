"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ScoreRow } from "@/lib/data";
import { formatScore } from "@/lib/data";
import { SourceBadge } from "@/components/TrustBadge";

type Key = keyof Pick<
  ScoreRow,
  "benchmarkName" | "category" | "modelName" | "vendor" | "score" | "rank" | "source" | "asOf"
>;

type Dir = "asc" | "desc";

const COLUMNS: { key: Key; label: string; numeric?: boolean; className?: string }[] = [
  { key: "benchmarkName", label: "Benchmark" },
  { key: "category", label: "Category" },
  { key: "modelName", label: "Model" },
  { key: "vendor", label: "Vendor" },
  { key: "score", label: "Score", numeric: true, className: "text-right" },
  { key: "rank", label: "Rank", numeric: true, className: "text-right" },
  { key: "source", label: "Source" },
  { key: "asOf", label: "As of", numeric: true, className: "text-right" },
];

export function ScoreTable({ rows }: { rows: ScoreRow[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<Key>("score");
  const [dir, setDir] = useState<Dir>("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter((r) =>
          [r.benchmarkName, r.category, r.modelName, r.vendor, r.source]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : rows;

    const sorted = [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rows, query, sortKey, dir]);

  const onSort = (key: Key, numeric?: boolean) => {
    if (key === sortKey) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir(numeric ? "desc" : "asc");
    }
  };

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by benchmark, model, vendor…"
          aria-label="Filter table rows"
          className="w-72 max-w-full rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-fg placeholder:text-faint focus:border-accent"
        />
        <span className="tnum ml-auto font-mono text-2xs text-faint">
          {filtered.length}/{rows.length} rows
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-line bg-surface">
              {COLUMNS.map((col) => {
                const activeSort = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      activeSort ? (dir === "asc" ? "ascending" : "descending") : "none"
                    }
                    className={`whitespace-nowrap px-3 py-2 text-left font-medium text-faint ${col.className ?? ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(col.key, col.numeric)}
                      className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-fg ${
                        col.numeric ? "flex-row-reverse" : ""
                      } ${activeSort ? "text-fg" : ""}`}
                    >
                      {col.label}
                      <span aria-hidden className="text-[0.6rem] text-accent">
                        {activeSort ? (dir === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={`${r.benchmarkId}-${r.modelId}`}
                className={`border-b border-line/50 last:border-0 hover:bg-elevated ${
                  i % 2 ? "bg-surface/40" : ""
                }`}
              >
                <td className="whitespace-nowrap px-3 py-1.5 text-fg">{r.benchmarkName}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-muted">{r.category}</td>
                <td className="whitespace-nowrap px-3 py-1.5">
                  <Link href={`/models/${r.modelId}`} className="text-fg hover:text-accent">
                    {r.modelName}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-1.5 text-muted">{r.vendor}</td>
                <td className="tnum whitespace-nowrap px-3 py-1.5 text-right font-mono font-semibold text-fg">
                  {formatScore(r.score)}
                </td>
                <td className="tnum whitespace-nowrap px-3 py-1.5 text-right font-mono text-muted">
                  {r.rank ?? "n/a"}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5">
                  <SourceBadge source={r.source} />
                </td>
                <td className="tnum whitespace-nowrap px-3 py-1.5 text-right font-mono text-faint">
                  {r.asOf}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-center text-xs text-muted">No rows match “{query}”.</p>
      )}
    </div>
  );
}
