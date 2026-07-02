import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";
import {
  benchmarks,
  leaderFor,
  scoredModels,
  scoresForBenchmark,
} from "@/lib/data";

// Short axis codes, same order as CATEGORIES.
const CODES = ["C", "B", "U", "T", "R", "M", "MM", "K", "D"];

const CX = 75;
const CY = 75;
const R = 56;

const angle = (i: number) => (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
const px = (i: number, r: number) => +(CX + r * Math.cos(angle(i))).toFixed(2);
const py = (i: number, r: number) => +(CY + r * Math.sin(angle(i))).toFixed(2);

// Within-benchmark min-max normalization of every score to [0,1].
// Single-score (or all-equal) benchmarks get 0.6: present but uninformative.
function normalizedScores(): Map<string, number> {
  const norm = new Map<string, number>();
  for (const b of benchmarks) {
    const ss = scoresForBenchmark(b.id);
    if (ss.length === 0) continue;
    const vals = ss.map((s) => s.score);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    for (const s of ss) {
      const v = max === min ? 0.6 : (s.score - min) / (max - min);
      norm.set(`${s.benchmarkId}:${s.modelId}`, v);
    }
  }
  return norm;
}

// Mean normalized score per category; null when the model has no score there.
function categoryStrengths(
  modelId: string,
  norm: Map<string, number>
): (number | null)[] {
  return CATEGORIES.map((cat: Category) => {
    const vals: number[] = [];
    for (const b of benchmarks) {
      if (b.category !== cat) continue;
      const v = norm.get(`${b.id}:${modelId}`);
      if (v !== undefined) vals.push(v);
    }
    if (vals.length === 0) return null;
    return vals.reduce((a, v) => a + v, 0) / vals.length;
  });
}

function Radar({ name, strengths }: { name: string; strengths: (number | null)[] }) {
  // ponytail: nulls collapse to the center for the polygon; the hollow circle
  // at the axis tip plus the shared legend mark them as "no data", not zero.
  const points = strengths
    .map((s, i) => `${px(i, (s ?? 0) * R)},${py(i, (s ?? 0) * R)}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 150 150"
      role="img"
      aria-label={`Capability fingerprint for ${name} across ${CATEGORIES.length} categories`}
      className="w-full max-w-[150px]"
    >
      <title>{`${name}: category fingerprint`}</title>
      {[0.33, 0.66].map((f) => (
        <circle key={f} cx={CX} cy={CY} r={R * f} fill="none" stroke="#22262e" />
      ))}
      {CATEGORIES.map((_, i) => (
        <line
          key={i}
          x1={CX}
          y1={CY}
          x2={px(i, R)}
          y2={py(i, R)}
          stroke="#22262e"
        />
      ))}
      <polygon
        points={points}
        fill="#5b9bff"
        fillOpacity="0.22"
        stroke="#5b9bff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {strengths.map((s, i) =>
        s === null ? (
          <circle
            key={i}
            cx={px(i, R)}
            cy={py(i, R)}
            r="2.5"
            fill="none"
            stroke="#333945"
            strokeWidth="1"
          >
            <title>{`${CATEGORIES[i]}: no data`}</title>
          </circle>
        ) : null
      )}
      {CODES.map((code, i) => (
        <text
          key={code}
          x={px(i, R + 9)}
          y={py(i, R + 9)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fill="#7b828d"
          className="font-mono"
        >
          {code}
        </text>
      ))}
    </svg>
  );
}

export function CategoryFingerprints() {
  const norm = normalizedScores();
  const wins = new Map<string, number>();
  for (const b of benchmarks) {
    const leader = leaderFor(b.id);
    if (leader?.model) wins.set(leader.model.id, (wins.get(leader.model.id) ?? 0) + 1);
  }
  const cards = scoredModels()
    .map((m) => ({
      model: m,
      wins: wins.get(m.id) ?? 0,
      strengths: categoryStrengths(m.id, norm),
    }))
    .sort((a, b) => b.wins - a.wins || a.model.name.localeCompare(b.model.name));

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map(({ model, wins: w, strengths }) => (
          <div
            key={model.id}
            className="flex flex-col items-center rounded-lg border border-line bg-surface p-4"
          >
            <Radar name={model.name} strengths={strengths} />
            <div className="mt-2 text-center">
              <div className="text-sm text-fg">{model.name}</div>
              <div className="text-2xs text-muted">{model.vendor}</div>
              <div className="tnum mt-1 font-mono text-2xs text-accent">
                {w} {w === 1 ? "win" : "wins"}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-2xs text-faint">
        {CODES.map((code, i) => (
          <span key={code}>
            <span className="font-mono">{code}</span>: {CATEGORIES[i]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 8 8" className="h-2 w-2" aria-hidden>
            <circle cx="4" cy="4" r="3" fill="none" stroke="#333945" strokeWidth="1.5" />
          </svg>
          hollow tip: no data in category
        </span>
      </div>
    </div>
  );
}
