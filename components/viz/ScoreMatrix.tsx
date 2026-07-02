"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";
import type { Benchmark, Flag, Model, Score } from "@/lib/types";
import { byCategory, formatScore, scoredModels, scoresForBenchmark } from "@/lib/data";

// Data is static JSON, so the whole matrix is precomputed at module scope.
const MODELS = scoredModels();
const TIP_W = 224; // matches w-56

interface CellData {
  score: Score;
  rank: number;
  total: number;
  alpha: number; // accent overlay opacity, min-max normalized within the row
}

interface RowData {
  benchmark: Benchmark;
  isElo: boolean;
  leaderId: string | null;
  cells: Map<string, CellData>;
}

function buildRow(b: Benchmark): RowData {
  const list = scoresForBenchmark(b.id); // sorted desc
  const max = list[0]?.score ?? 0;
  const min = list[list.length - 1]?.score ?? 0;
  const flat = list.length < 2 || max === min; // single-score rows get mid intensity
  const cells = new Map<string, CellData>();
  list.forEach((s, i) => {
    cells.set(s.modelId, {
      score: s,
      rank: i + 1,
      total: list.length,
      alpha: flat ? 0.55 : 0.15 + 0.8 * ((s.score - min) / (max - min)),
    });
  });
  return { benchmark: b, isElo: max > 100, leaderId: list[0]?.modelId ?? null, cells };
}

const GROUPS = byCategory().map((g) => ({
  category: g.category,
  rows: g.benchmarks.map(buildRow),
}));

// Overall reveal order: category bands and benchmark rows in render sequence.
const SEQ = new Map<string, number>();
{
  let i = 0;
  for (const g of GROUPS) {
    SEQ.set(`cat:${g.category}`, i++);
    for (const r of g.rows) SEQ.set(r.benchmark.id, i++);
  }
}
const rvDelay = (i: number) =>
  ({ "--rv-delay": `${Math.min(i * 18, 500)}ms` }) as React.CSSProperties;

// Same glyph vocabulary as TrustBadge: ！ danger, △ warn, ✓ ok.
const FLAG_GLYPHS: { flag: Flag; glyph: string; cls: string; label: string }[] = [
  { flag: "contaminated", glyph: "！", cls: "text-danger", label: "contaminated" },
  { flag: "saturated", glyph: "△", cls: "text-warn", label: "saturated" },
  { flag: "scaffold-dependent", glyph: "▵", cls: "text-warn", label: "scaffold dependent" },
  { flag: "independent", glyph: "✓", cls: "text-ok", label: "independent" },
];

function FlagGlyphs({ flags }: { flags: Flag[] }) {
  const present = FLAG_GLYPHS.filter((g) => flags.includes(g.flag));
  if (present.length === 0) return null;
  return (
    <span
      className="ml-1 inline-flex shrink-0 gap-0.5 text-[9px] leading-none"
      title={`Flags: ${present.map((g) => g.label).join(", ")}`}
    >
      {present.map((g) => (
        <span key={g.flag} className={g.cls}>
          {g.glyph}
        </span>
      ))}
    </span>
  );
}

interface Tip {
  b: Benchmark;
  m: Model;
  cell: CellData;
  left: number;
  top: number;
  above: boolean;
}

export function ScoreMatrix() {
  const [focus, setFocus] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const cols = { gridTemplateColumns: `176px repeat(${MODELS.length}, minmax(72px, 1fr))` };

  const onEnterCell = (e: React.MouseEvent<HTMLDivElement>, row: RowData, m: Model) => {
    const cell = row.cells.get(m.id);
    const grid = gridRef.current;
    const scroller = scrollRef.current;
    if (!cell || !grid || !scroller) return;
    const cr = e.currentTarget.getBoundingClientRect();
    const gr = grid.getBoundingClientRect();
    // Clamp horizontally to the visible part of the scroll container.
    let left = cr.left - gr.left + cr.width / 2 - TIP_W / 2;
    const lo = scroller.scrollLeft + 4;
    const hi = scroller.scrollLeft + scroller.clientWidth - TIP_W - 4;
    left = Math.max(lo, Math.min(left, Math.max(lo, hi)));
    const above = cr.top - gr.top > 140;
    const top = above ? cr.top - gr.top - 6 : cr.bottom - gr.top + 6;
    setTip({ b: row.benchmark, m, cell, left, top, above });
  };

  return (
    <Reveal className="rounded-lg border border-line bg-surface">
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        aria-label="Score matrix: benchmarks by model"
      >
        <div ref={gridRef} className="relative grid min-w-[820px]" style={cols}>
          {/* header row */}
          <div className="sticky left-0 z-20 flex items-end border-b border-line bg-surface px-2 pb-1.5 pt-2">
            <span className="text-2xs text-faint">click a model to focus</span>
          </div>
          {MODELS.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col items-center justify-end gap-0.5 border-b border-l border-line px-1 pb-1.5 pt-2 text-center transition-opacity duration-200 ${
                focus && focus !== m.id ? "opacity-25" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setFocus(focus === m.id ? null : m.id)}
                aria-pressed={focus === m.id}
                title={
                  focus === m.id
                    ? `Clear focus on ${m.name}`
                    : `Focus ${m.name}: dims all other columns`
                }
                className={`press rounded px-0.5 text-2xs font-medium leading-tight focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent ${
                  focus === m.id ? "text-accent" : "text-muted hover:text-fg"
                }`}
              >
                {m.name}
                {focus === m.id && <span aria-hidden> ●</span>}
              </button>
              <Link
                href={`/models/${m.id}`}
                title={`Open ${m.name} detail page`}
                className="rounded font-mono text-[10px] leading-none text-faint hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
              >
                ↗<span className="sr-only">{m.name} details</span>
              </Link>
            </div>
          ))}

          {GROUPS.map((g) => (
            <div key={g.category} className="contents">
              {/* category band spans all columns */}
              <div
                className="rv border-t border-line bg-elevated/60 py-1"
                style={{ gridColumn: "1 / -1", ...rvDelay(SEQ.get(`cat:${g.category}`) ?? 0) }}
              >
                <span className="sticky left-0 inline-block px-2 font-mono text-2xs uppercase tracking-wide text-faint">
                  {g.category}
                </span>
              </div>

              {g.rows.map((row) => (
                <div key={row.benchmark.id} className="contents">
                  <div
                    className="rv sticky left-0 z-10 flex min-w-0 items-center border-b border-line bg-surface px-2 py-1"
                    style={rvDelay(SEQ.get(row.benchmark.id) ?? 0)}
                  >
                    <span
                      className="truncate text-2xs text-fg"
                      title={row.benchmark.name}
                    >
                      {row.benchmark.name}
                    </span>
                    <FlagGlyphs flags={row.benchmark.flags} />
                    {row.isElo && (
                      <span
                        className="ml-1 shrink-0 rounded border border-line px-1 font-mono text-[9px] leading-tight text-faint"
                        title="This row reports an Elo rating, not a percentage"
                      >
                        elo
                      </span>
                    )}
                  </div>

                  {MODELS.map((m) => {
                    const cell = row.cells.get(m.id);
                    const dim = focus && focus !== m.id ? "opacity-25" : "";
                    if (!cell) {
                      return (
                        <div
                          key={m.id}
                          title={`${row.benchmark.name}, ${m.name}: no score`}
                          className={`flex h-8 items-center justify-center border-b border-l border-line bg-surface transition-opacity duration-200 ${dim}`}
                        >
                          {/* reveal lives on the content, not the cell: .in .rv would
                              out-specificity the focus-dimming opacity utility */}
                          <span
                            aria-hidden
                            className="fade text-2xs text-faint/60"
                            style={rvDelay(SEQ.get(row.benchmark.id) ?? 0)}
                          >
                            ·
                          </span>
                        </div>
                      );
                    }
                    const leader = row.leaderId === m.id;
                    return (
                      <div
                        key={m.id}
                        onMouseEnter={(e) => onEnterCell(e, row, m)}
                        onMouseLeave={() => setTip(null)}
                        title={`${row.benchmark.name}, ${m.name}: ${formatScore(cell.score.score)}${leader ? ", row leader" : ""}`}
                        className={`relative flex h-8 items-center justify-center border-b border-l border-line transition-opacity duration-200 ${dim} ${
                          leader ? "ring-1 ring-inset ring-accent" : ""
                        }`}
                      >
                        <div
                          className="fade absolute inset-0 flex items-center justify-center"
                          style={rvDelay(SEQ.get(row.benchmark.id) ?? 0)}
                        >
                          <div
                            aria-hidden
                            className="absolute inset-0 bg-accent"
                            style={{ opacity: cell.alpha }}
                          />
                          {leader && (
                            <span
                              aria-hidden
                              className="absolute right-0.5 top-0.5 font-mono text-[8px] leading-none text-fg"
                            >
                              1
                            </span>
                          )}
                          <span className="tnum relative hidden font-mono text-2xs text-fg sm:block">
                            {formatScore(cell.score.score)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}

          {tip && (
            <div
              role="tooltip"
              className={`pointer-events-none absolute z-30 w-56 rounded-md border border-line-strong bg-elevated p-2 shadow-lg ${
                tip.above ? "-translate-y-full" : ""
              }`}
              style={{ left: tip.left, top: tip.top }}
            >
              <p className="truncate text-2xs font-medium text-fg">{tip.b.name}</p>
              <p className="truncate text-2xs text-muted">{tip.m.name}</p>
              <p className="tnum mt-1 font-mono text-sm font-semibold text-fg">
                {formatScore(tip.cell.score.score)}
                <span className="ml-2 text-2xs font-normal text-muted">
                  rank {tip.cell.rank} of {tip.cell.total}
                </span>
              </p>
              <p className="mt-1 text-2xs">
                {tip.cell.score.source === "independent" ? (
                  <span className="text-ok">✓ independent</span>
                ) : (
                  <span className="text-muted">• vendor reported</span>
                )}
                <span className="tnum ml-2 font-mono text-faint">as of {tip.cell.score.asOf}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* legend */}
      <div
        className="rv flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line px-3 py-2 text-2xs text-muted"
        style={{ "--rv-delay": "520ms" } as React.CSSProperties}
      >
        <span className="inline-flex items-center gap-1">
          <span className="inline-flex overflow-hidden rounded-sm border border-line">
            {[0.15, 0.55, 0.95].map((o) => (
              <span key={o} aria-hidden className="h-3 w-3 bg-accent" style={{ opacity: o }} />
            ))}
          </span>
          low to high, scaled within each row
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            aria-hidden
            className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-accent/70 ring-1 ring-inset ring-accent"
          >
            <span className="font-mono text-[8px] leading-none text-fg">1</span>
          </span>
          row leader
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            aria-hidden
            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-line bg-surface text-faint/60"
          >
            ·
          </span>
          no score
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-danger">！ contaminated</span>
          <span className="text-warn">△ saturated</span>
          <span className="text-warn">▵ scaffold</span>
          <span className="text-ok">✓ independent</span>
        </span>
        <span className="font-mono text-faint">elo = rating, not %</span>
      </div>
    </Reveal>
  );
}
