import type { Metadata } from "next";
import type { Flag } from "@/lib/types";
import { FlagBadge, TrustBadge } from "@/components/TrustBadge";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "What each trust flag means, how scaffold and sourcing change a score, and why benchmark aggregators disagree.",
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Methodology</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This dashboard does not average leaderboards into one number. It keeps
          the disagreement visible and labels why any given score should be
          trusted less. Here is what each flag means.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-fg">Trust flags</h2>
        <dl className="mt-4 space-y-5">
          {FLAG_DOCS.map(({ flag, body }) => (
            <div key={flag} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <dt className="sm:w-48 sm:shrink-0">
                <FlagBadge flag={flag} />
              </dt>
              <dd className="text-sm leading-relaxed text-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Section title="Scaffold: model vs system">
        <p>
          Every benchmark is tagged with what its score really measures. A{" "}
          <TrustBadge tone="neutral" label="Scaffold: model" mark={false} /> score
          reflects the base model answering on its own. A{" "}
          <TrustBadge tone="neutral" label="Scaffold: system" mark={false} /> score
          reflects a full agent (tool calls, retries, turn budgets), where the
          harness can matter more than the model. <TrustBadge tone="neutral" label="Scaffold: mixed" mark={false} />{" "}
          sits in between. This is why an identical model posts different numbers
          on SWE-bench Verified and SWE-bench Pro.
        </p>
      </Section>

      <Section title="Live vs static, and contamination resistance">
        <p>
          <TrustBadge tone="neutral" label="Static" mark={false} /> benchmarks are
          fixed snapshots; once they circulate, contamination creeps in.{" "}
          <TrustBadge tone="info" label="Live" mark={false} /> benchmarks run
          against changing targets, which resists memorization but hurts
          reproducibility. A{" "}
          <TrustBadge tone="ok" label="Contamination-resistant" /> tag means the
          set is fresh or held out specifically to defeat memorized answers.
        </p>
      </Section>

      <Section title="Why aggregators disagree">
        <p>
          Composite indexes rank the same models in different orders, and that is
          not a bug. They weight categories differently, run different scaffolds,
          mix vendor and independent numbers, and refresh on different schedules.
          A coding-weighted index rewards different models than a reasoning-weighted
          one.
        </p>
        <p>
          So we never re-rank their outputs into a single consensus that would
          only manufacture false agreement. We pull specific, matched benchmark
          rows from a few sources and link out to the rest. When you need one
          answer, pick the benchmark closest to your actual task, filter to the{" "}
          <TrustBadge tone="ok" label="Honest view" /> (contamination-resistant and
          independent), and read the gap as a range rather than a verdict.
        </p>
      </Section>

      <Section title="How scores refresh">
        <p>
          A daily job fetches a fixed set of source leaderboards (Artificial
          Analysis, LLM-Stats, and Steel), hands each page to a model, and asks
          it to extract scores into a strict schema. Only rows that map to a
          known benchmark and a known model are merged, so benchmark definitions
          are never dropped and one dead source never breaks the run.
        </p>
        <p>
          Any benchmark marked{" "}
          <code className="rounded bg-elevated px-1 py-0.5 font-mono text-2xs text-fg">
            locked
          </code>{" "}
          is left untouched, so manually graded results (like olympiad proofs)
          are never overwritten by an automated pass. Sources we only reference,
          such as Agent Arena and LMArena, are linked from the overview and never
          scraped.
        </p>
      </Section>
    </div>
  );
}
