import type { Metadata } from "next";
import type { Flag } from "@/lib/types";
import { FlagBadge } from "@/components/TrustBadge";
import { Reveal } from "@/components/Reveal";
import { RealityGap } from "@/components/viz/RealityGap";
import { TrustCensus } from "@/components/viz/TrustCensus";

export const metadata: Metadata = {
  title: "Trust",
  description:
    "The trust layer, visualized: how AI compares to human baselines, how many benchmarks survive scrutiny, and what every flag means.",
};

const FLAG_DOCS: { flag: Flag; body: string }[] = [
  {
    flag: "saturated",
    body: "The top of the leaderboard is bunched within a point or two. At that point rank order is mostly measurement noise, not capability. Treat gaps as ties.",
  },
  {
    flag: "contaminated",
    body: "There is known or strongly suspected leakage of the eval set into training data. Scores read higher than real-world capability, and the effect is uneven across models.",
  },
  {
    flag: "scaffold-dependent",
    body: "The number reflects the whole agent (retrieval, tools, retries, turn limits) as much as the base model. Swap the harness and the ranking can flip.",
  },
  {
    flag: "vendor-reported",
    body: "Published by the model's own vendor on their own harness. Not wrong, but not neutral: setup choices favor the reporter. We always label it.",
  },
  {
    flag: "independent",
    body: "Run and reported by a third party with no stake in the outcome. The closest thing to a neutral read, though the scaffold still matters.",
  },
];

const FINE_PRINT: { title: string; body: string }[] = [
  {
    title: "Scaffold",
    body: "Model scores test the model alone. System scores test the whole agent: tools, retries, turn budgets. Swap the harness and rankings can flip.",
  },
  {
    title: "Freshness",
    body: "Static sets leak into training data over time. Live sets resist memorization but are harder to reproduce.",
  },
  {
    title: "Refresh",
    body: "A daily job scrapes three sources and merges only rows matching a known benchmark and model. Benchmarks marked locked are never overwritten.",
  },
];

function Section({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-10">
      <Reveal>
        <h2 className="rv text-lg font-semibold text-fg">{title}</h2>
        {lede && (
          <p
            className="rv mt-1 max-w-2xl text-xs text-muted"
            style={{ "--rv-delay": "60ms" } as React.CSSProperties}
          >
            {lede}
          </p>
        )}
      </Reveal>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function TrustPage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="load-in text-2xs font-mono uppercase tracking-[0.2em] text-faint">
          The trust layer
        </p>
        <h1
          className="load-in mt-2 text-2xl font-semibold tracking-tight text-fg md:text-3xl"
          style={{ "--d": "60ms" } as React.CSSProperties}
        >
          How much of the leaderboard is real?
        </h1>
        <p
          className="load-in mt-2 max-w-2xl text-sm leading-relaxed text-muted"
          style={{ "--d": "140ms" } as React.CSSProperties}
        >
          Benchmarks leak, saturate, and inherit their harnesses. This page puts
          numbers on it.
        </p>
      </header>

      <Section
        title="The reality gap"
        lede="Best AI score vs published human expert baselines. AI-ahead rows on top."
      >
        <RealityGap />
      </Section>

      <Section
        title="Trust census"
        lede="Every benchmark by its worst flag, every score by who reported it."
      >
        <TrustCensus />
      </Section>

      <Section
        title="What each flag means"
        lede="The vocabulary behind every badge on this site."
      >
        <Reveal>
          <dl className="space-y-5">
            {FLAG_DOCS.map(({ flag, body }, i) => (
              <div
                key={flag}
                className="rv flex flex-col gap-2 sm:flex-row sm:gap-4"
                style={{ "--rv-delay": `${i * 50}ms` } as React.CSSProperties}
              >
                <dt className="sm:w-48 sm:shrink-0">
                  <FlagBadge flag={flag} />
                </dt>
                <dd className="max-w-2xl text-sm leading-relaxed text-muted">{body}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>

      <Section title="The fine print">
        <Reveal className="grid gap-3 sm:grid-cols-3">
          {FINE_PRINT.map(({ title, body }, i) => (
            <div
              key={title}
              className="pop rounded-lg border border-line bg-surface p-4"
              style={{ "--rv-delay": `${i * 70}ms` } as React.CSSProperties}
            >
              <h3 className="text-sm font-semibold text-fg">{title}</h3>
              <p className="mt-1.5 text-2xs leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </Reveal>
      </Section>
    </div>
  );
}
