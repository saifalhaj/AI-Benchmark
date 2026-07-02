"use client";

import type { Category } from "@/lib/types";

export interface BenchmarkFilterState {
  category: string; // "" = all
  contaminationResistant: boolean;
  live: boolean;
  independent: boolean;
}

export const DEFAULT_FILTERS: BenchmarkFilterState = {
  category: "",
  contaminationResistant: false,
  live: false,
  independent: false,
};

function Toggle({
  label,
  checked,
  onChange,
  title,
  tone = "default",
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  title?: string;
  tone?: "default" | "ok";
}) {
  const active =
    tone === "ok"
      ? "border-ok/50 bg-ok-soft text-ok"
      : "border-accent/50 bg-accent-soft text-accent";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={title}
      onClick={() => onChange(!checked)}
      className={`press inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
        checked ? active : "border-line bg-surface text-muted hover:border-line-strong"
      }`}
    >
      <span
        aria-hidden
        className={`grid h-3.5 w-3.5 place-items-center rounded-sm border text-[0.6rem] leading-none ${
          checked ? "border-current" : "border-line-strong"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

export function Filters({
  categories,
  value,
  onChange,
  resultCount,
  total,
}: {
  categories: Category[];
  value: BenchmarkFilterState;
  onChange: (next: BenchmarkFilterState) => void;
  resultCount: number;
  total: number;
}) {
  const set = (patch: Partial<BenchmarkFilterState>) =>
    onChange({ ...value, ...patch });

  const honestOn = value.contaminationResistant && value.independent;
  const dirty =
    value.category !== "" ||
    value.contaminationResistant ||
    value.live ||
    value.independent;

  return (
    <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          value={value.category}
          onChange={(e) => set({ category: e.target.value })}
          className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-fg focus:border-accent"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <Toggle
          label="Contamination-resistant"
          checked={value.contaminationResistant}
          onChange={(v) => set({ contaminationResistant: v })}
          title="Only benchmarks built to resist memorized answers."
        />
        <Toggle
          label="Independent"
          checked={value.independent}
          onChange={(v) => set({ independent: v })}
          title="Only benchmarks with independent third-party reporting."
        />
        <Toggle
          label="Live"
          checked={value.live}
          onChange={(v) => set({ live: v })}
          title="Only benchmarks that run against live targets."
        />

        <span className="mx-1 h-5 w-px bg-line" aria-hidden />

        <Toggle
          label="Honest view"
          tone="ok"
          checked={honestOn}
          onChange={(v) =>
            set({ contaminationResistant: v, independent: v })
          }
          title="Contamination-resistant AND independent only. The view that resists gaming."
        />

        <div className="ml-auto flex items-center gap-3">
          <span className="tnum font-mono text-2xs text-faint">
            {resultCount}/{total}
          </span>
          {dirty && (
            <button
              type="button"
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="press text-2xs text-muted underline-offset-2 hover:text-fg hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
