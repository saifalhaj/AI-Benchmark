import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { benchmarks, scores } from "@/lib/data";
import type { Benchmark } from "@/lib/types";

// Worst standing wins: contaminated > saturated > scaffold-dependent >
// vendor-reported only > independent and clean.
type Standing = "contaminated" | "saturated" | "scaffold" | "vendor" | "clean";

const STANDING_META: Record<
  Standing,
  { tile: string; swatch: string; glyph: string; label: string }
> = {
  contaminated: { tile: "bg-danger", swatch: "bg-danger", glyph: "!", label: "contaminated" },
  saturated: { tile: "bg-warn", swatch: "bg-warn", glyph: "s", label: "saturated" },
  scaffold: { tile: "bg-warn/45", swatch: "bg-warn/45", glyph: "d", label: "scaffold-dependent" },
  vendor: { tile: "bg-line-strong", swatch: "bg-line-strong", glyph: "v", label: "vendor-reported only" },
  clean: { tile: "bg-ok", swatch: "bg-ok", glyph: "i", label: "independent, clean" },
};

const STANDING_ORDER: Standing[] = ["contaminated", "saturated", "scaffold", "vendor", "clean"];

const standingOf = (b: Benchmark): Standing => {
  if (b.flags.includes("contaminated")) return "contaminated";
  if (b.flags.includes("saturated")) return "saturated";
  if (b.flags.includes("scaffold-dependent")) return "scaffold";
  if (b.flags.includes("vendor-reported")) return "vendor";
  return "clean";
};

export function TrustCensus() {
  const total = benchmarks.length;
  const counts = new Map<Standing, number>();
  for (const b of benchmarks) {
    const s = standingOf(b);
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  const independent = scores.filter((s) => s.source === "independent").length;
  const vendor = scores.length - independent;
  const indPct = Math.round((independent / scores.length) * 100);

  const honest = benchmarks.filter(
    (b) => b.contaminationResistant && b.flags.includes("independent"),
  ).length;

  return (
    <Reveal className="grid gap-6 lg:grid-cols-2">
      {/* Part A: one tile per benchmark, colored by worst standing */}
      <div>
        <h3 className="mb-2 text-2xs font-medium uppercase tracking-wide text-faint">
          Benchmark census: worst standing per benchmark
        </h3>
        <div
          className="grid max-w-[340px] grid-cols-7 gap-1"
          role="img"
          aria-label={`${total} benchmarks colored by their worst trust flag`}
        >
          {benchmarks.map((b, i) => {
            const meta = STANDING_META[standingOf(b)];
            const flagText = b.flags.length ? b.flags.join(", ") : "no flags";
            return (
              <div
                key={b.id}
                title={`${b.name}: ${flagText}`}
                role="img"
                aria-label={`${b.name}: ${flagText}`}
                className={`pop flex aspect-square items-center justify-center rounded ${meta.tile}`}
                style={{ "--rv-delay": `${Math.min(i * 14, 400)}ms` } as React.CSSProperties}
              >
                <span aria-hidden className="text-[10px] font-medium leading-none text-bg">
                  {meta.glyph}
                </span>
              </div>
            );
          })}
        </div>
        <ul className="rv mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {STANDING_ORDER.map((s) => {
            const meta = STANDING_META[s];
            return (
              <li key={s} className="flex items-center gap-1.5 text-2xs text-muted">
                <span
                  aria-hidden
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm ${meta.swatch}`}
                >
                  <span className="text-[9px] font-medium leading-none text-bg">{meta.glyph}</span>
                </span>
                {meta.label}{" "}
                <span className="tnum font-mono text-fg">{counts.get(s) ?? 0}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-6">
        {/* Part B: every score row split by who ran it */}
        <div>
          <h3 className="mb-2 text-2xs font-medium uppercase tracking-wide text-faint">
            Who ran the numbers: all {scores.length} score rows
          </h3>
          <div
            className="flex h-7 overflow-hidden rounded border border-line"
            role="img"
            aria-label={`${independent} of ${scores.length} scores independently run, ${vendor} vendor-reported`}
          >
            <div className="grow-x bg-ok/70" style={{ width: `${indPct}%` }} />
            <div className="flex-1 bg-line-strong" />
          </div>
          <div className="rv mt-1.5 flex justify-between text-2xs">
            <span className="tnum font-mono text-ok">
              {independent} independent ({indPct}%)
            </span>
            <span className="tnum font-mono text-muted">
              {vendor} vendor ({100 - indPct}%)
            </span>
          </div>
        </div>

        {/* Part C: the honest number */}
        <div className="rounded-lg border border-line bg-surface p-4">
          <div className="tnum font-mono text-4xl text-fg">
            <CountUp value={honest} />
            <span className="text-lg text-faint"> / {total}</span>
          </div>
          <div className="mt-1 text-sm font-medium text-fg">survive the honest view</div>
          <p className="mt-1 text-2xs text-muted">
            Contamination-resistant and independently run: the only scores worth quoting
            without a caveat.
          </p>
          <Link
            href="/explore"
            className="press mt-3 inline-block rounded text-2xs font-medium text-accent hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Explore the full picture &rarr;
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
