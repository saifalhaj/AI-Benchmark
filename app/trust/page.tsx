import type { Metadata } from "next";
import type { Flag } from "@/lib/types";
import { FlagBadge, TrustBadge } from "@/components/TrustBadge";
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
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      {lede && <p className="mt-1 max-w-2xl text-xs text-muted">{lede}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function TrustPage() {
  return (
    <div className="space-y-12">
      <header>
        <p className="text-2xs font-mono uppercase tracking-[0.2em] text-faint">
          The trust layer
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
          How much of the leaderboard is real?
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Benchmarks leak, saturate, and inherit their harnesses. This page puts
          numbers on all three problems instead of asking you to take rankings
          on faith.
        </p>
      </header>

      <Section
        title="The reality gap"
        lede="Where the best AI score stands against measured human expert baselines, benchmark by benchmark. Above the human line on some, far below on others: both facts matter."
      >
        <RealityGap />
      </Section>

      <Section
        title="Trust census"
        lede="Every benchmark tiled by its most serious flag, every score row split by who reported it, and the count that survives the strictest filter."
      >
        <TrustCensus />
      </Section>

      <Section
        title="What each flag means"
        lede="The plain-English glossary behind every badge on this site."
      >
        <dl className="space-y-5">
          {FLAG_DOCS.map(({ flag, body }) => (
            <div key={flag} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <dt className="sm:w-48 sm:shrink-0">
                <FlagBadge flag={flag} />
              </dt>
              <dd className="max-w-2xl text-sm leading-relaxed text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Scaffold, freshness, and refresh">
        <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Every benchmark is tagged with what its score really measures.{" "}
            <TrustBadge tone="neutral" label="Scaffold: model" mark={false} /> reflects
            the base model on its own;{" "}
            <TrustBadge tone="neutral" label="Scaffold: system" mark={false} /> reflects
            a full agent (tool calls, retries, turn budgets), where the harness can
            matter more than the model. This is why one model posts different
            numbers on SWE-bench Verified and SWE-bench Pro.
          </p>
          <p>
            <TrustBadge tone="neutral" label="Static" mark={false} /> benchmarks are
            fixed snapshots; once they circulate, contamination creeps in.{" "}
            <TrustBadge tone="info" label="Live" mark={false} /> benchmarks run against
            changing targets, which resists memorization but hurts reproducibility.
          </p>
          <p>
            A daily job fetches Artificial Analysis, LLM-Stats, and Steel, asks a
            model to extract scores into a strict schema, and merges only rows that
            match a known benchmark and a known model. Benchmarks marked{" "}
            <code className="rounded bg-elevated px-1 py-0.5 font-mono text-2xs text-fg">
              locked
            </code>{" "}
            are never overwritten, so hand-graded results stay hand-graded. Agent
            Arena, LMArena, and SWE-bench are linked, never scraped, and never
            re-ranked into a false consensus.
          </p>
        </div>
      </Section>
    </div>
  );
}
