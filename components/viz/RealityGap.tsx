import { Reveal } from "@/components/Reveal";
import { benchmarks, leaderFor } from "@/lib/data";

// Dumbbell chart: human expert baseline (hollow) vs best AI score (filled)
// for every benchmark that publishes a human baseline. Server component,
// hover detail via native SVG <title>.

interface Row {
  name: string;
  human: number;
  ai: number;
  model: string;
}

const rows: Row[] = benchmarks
  .flatMap((b) => {
    if (b.humanBaseline === null) return [];
    const leader = leaderFor(b.id);
    if (!leader) return [];
    return [
      {
        name: b.name,
        human: b.humanBaseline,
        ai: leader.score.score,
        model: leader.model?.name ?? leader.score.modelId,
      },
    ];
  })
  .sort((a, b) => b.ai - b.human - (a.ai - a.human));

// Geometry (viewBox units). Label column left, plot center, delta right.
const W = 640;
const X0 = 188;
const X1 = 580;
const ROW_H = 44;
const TOP = 22;
const H = TOP + rows.length * ROW_H + 8;
const R = 5;

const x = (v: number) => X0 + (v / 100) * (X1 - X0);

const signed = (d: number) => (d >= 0 ? `+${d.toFixed(1)}` : d.toFixed(1));

export function RealityGap() {
  return (
    <Reveal>
      <section className="rounded-lg border border-line bg-surface p-4">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full min-w-[640px]"
          role="img"
          aria-label="Dumbbell chart comparing the best AI score to the human expert baseline on six benchmarks"
        >
          {/* gridlines + axis labels, 0 to 100 percent */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line
                x1={x(v)}
                y1={TOP}
                x2={x(v)}
                y2={TOP + rows.length * ROW_H}
                stroke="#22262e"
                strokeWidth={1}
              />
              <text
                x={x(v)}
                y={14}
                textAnchor="middle"
                fontSize={10}
                fill="#7b828d"
                className="font-mono tnum"
              >
                {v}
              </text>
            </g>
          ))}

          {rows.map((r, i) => {
            const cy = TOP + i * ROW_H + ROW_H / 2;
            const xH = x(r.human);
            const xA = x(r.ai);
            const d = r.ai - r.human;
            const ahead = d >= 0;
            const lo = Math.min(xH, xA);
            const hi = Math.max(xH, xA);
            return (
              <g
                key={r.name}
                className="fade"
                style={{ "--rv-delay": `${i * 90}ms` } as React.CSSProperties}
              >
                <title>
                  {`${r.name}: human ${r.human.toFixed(1)}%, best AI (${r.model}) ${r.ai.toFixed(1)}%, delta ${signed(d)} pts`}
                </title>
                <text x={0} y={cy - 3} fontSize={12} fill="#e7e9ee">
                  {r.name}
                </text>
                <text x={0} y={cy + 11} fontSize={11} fill="#9aa2ad">
                  {r.model}
                </text>
                {hi - lo > 2 * R + 4 && (
                  <line
                    x1={lo + R + 1}
                    y1={cy}
                    x2={hi - R - 1}
                    y2={cy}
                    stroke={ahead ? "#5b9bff" : "#333945"}
                    strokeOpacity={ahead ? 0.6 : 1}
                    strokeWidth={2}
                  />
                )}
                <circle
                  cx={xH}
                  cy={cy}
                  r={R}
                  fill="none"
                  stroke="#9aa2ad"
                  strokeWidth={1.5}
                />
                <text
                  x={xH}
                  y={cy - 9}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#7b828d"
                  className="font-mono"
                  aria-hidden
                >
                  H
                </text>
                <circle cx={xA} cy={cy} r={R} fill="#5b9bff" />
                <text
                  x={W - 4}
                  y={cy + 4}
                  textAnchor="end"
                  fontSize={12}
                  fill="#e7e9ee"
                  className="font-mono tnum"
                >
                  {signed(d)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="rv mt-2 text-2xs text-muted">
        <span aria-hidden>○</span> hollow, H = human expert baseline
        <span className="mx-2 text-faint">·</span>
        <span aria-hidden className="text-accent">●</span> filled = best AI
        score
        <span className="mx-2 text-faint">·</span>
        delta = AI minus human, percentage points
      </p>
      </section>
    </Reveal>
  );
}
