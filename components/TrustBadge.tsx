import type { Benchmark, Flag, Scaffold } from "@/lib/types";

type Tone = "warn" | "danger" | "ok" | "neutral" | "info";

const toneClass: Record<Tone, string> = {
  warn: "border-warn/40 bg-warn-soft text-warn",
  danger: "border-danger/40 bg-danger-soft text-danger",
  ok: "border-ok/40 bg-ok-soft text-ok",
  neutral: "border-line-strong bg-elevated text-muted",
  info: "border-accent/40 bg-accent-soft text-accent",
};

// Leading mark is a text glyph (not an icon font, not an emoji) so meaning
// never rides on color alone.
const toneMark: Record<Tone, string> = {
  warn: "△",
  danger: "！",
  ok: "✓",
  neutral: "•",
  info: "→",
};

export function TrustBadge({
  tone,
  label,
  title,
  mark = true,
}: {
  tone: Tone;
  label: string;
  title?: string;
  mark?: boolean;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-2xs font-medium uppercase tracking-wide ${toneClass[tone]}`}
    >
      {mark && <span aria-hidden className="text-[0.65em] leading-none">{toneMark[tone]}</span>}
      {label}
    </span>
  );
}

const FLAG_META: Record<Flag, { tone: Tone; label: string; title: string }> = {
  saturated: {
    tone: "warn",
    label: "Saturated",
    title: "Top scores are clustered; differences are close to noise.",
  },
  contaminated: {
    tone: "danger",
    label: "Contaminated",
    title: "Known eval-set leakage into training data.",
  },
  "scaffold-dependent": {
    tone: "warn",
    label: "Scaffold-dependent",
    title: "The score reflects the harness/agent as much as the base model.",
  },
  "vendor-reported": {
    tone: "neutral",
    label: "Vendor-reported",
    title: "Numbers published by the model vendor, not an independent runner.",
  },
  independent: {
    tone: "ok",
    label: "Independent",
    title: "Run and reported by an independent third party.",
  },
};

export function FlagBadge({ flag }: { flag: Flag }) {
  const m = FLAG_META[flag];
  return <TrustBadge tone={m.tone} label={m.label} title={m.title} />;
}

const SCAFFOLD_META: Record<Scaffold, string> = {
  model: "Reflects the base model on its own.",
  system: "Reflects the full agent/harness, not the model alone.",
  mixed: "Blends model and harness contributions.",
};

// The full trust strip for a benchmark: source + integrity + scaffold in one row.
export function TrustStrip({ benchmark }: { benchmark: Benchmark }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {benchmark.flags.map((f) => (
        <FlagBadge key={f} flag={f} />
      ))}
      {benchmark.contaminationResistant && (
        <TrustBadge
          tone="ok"
          label="Contamination-resistant"
          title="Built to resist memorized answers (fresh or held-out data)."
        />
      )}
      <TrustBadge
        tone="neutral"
        label={`Scaffold: ${benchmark.scaffold}`}
        title={SCAFFOLD_META[benchmark.scaffold]}
        mark={false}
      />
      <TrustBadge
        tone={benchmark.liveOrStatic === "live" ? "info" : "neutral"}
        label={benchmark.liveOrStatic === "live" ? "Live" : "Static"}
        title={
          benchmark.liveOrStatic === "live"
            ? "Runs against live, changing targets."
            : "Fixed, snapshot task set."
        }
        mark={false}
      />
    </div>
  );
}

export function SourceBadge({ source }: { source: "vendor" | "independent" }) {
  return source === "independent" ? (
    <TrustBadge tone="ok" label="Independent" title="Third-party run." />
  ) : (
    <TrustBadge tone="neutral" label="Vendor" title="Vendor-reported number." />
  );
}
