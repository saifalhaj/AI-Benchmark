# Benchmark/Trust — AI Agent Benchmark Dashboard

A dense, dark dashboard that aggregates AI agent + model benchmarks across many
categories into one view — with a **trust layer** that flags saturation,
contamination, scaffold-dependence, and vendor-vs-independent sourcing instead
of hiding the disagreement between leaderboards.

No backend. All data lives in one static JSON file. A daily GitHub Action asks
the Anthropic API to refresh that file. The site itself is fully static and
needs no key to build or view.

## Stack

- **Next.js** (App Router) + **TypeScript**, statically rendered
- **Tailwind CSS** (dark-only "instrument panel" theme, Geist + Geist Mono)
- Data: `data/benchmarks.json` (normalized models / benchmarks / scores)
- Refresh: `scripts/update.ts` → Anthropic API (web search) → rewrite JSON
- Deploy: **Vercel** (import from GitHub, auto-deploy on push to default branch)

No user-facing AI calls. No chart library — lightweight CSS/SVG bars only.

## Pages

| Route | What |
|---|---|
| `/` | **Atlas**: score matrix heatmap of every score, leader spread, capability fingerprints, sources |
| `/trust` | **Trust**: human-vs-AI reality gap chart, trust census waffle, flag glossary |
| `/explore` | **Explore**: benchmark cards (honest-view filter) or the full sortable master table |
| `/models/[id]` | One model across every benchmark, with source tags |

Old routes (`/benchmarks`, `/table`, `/methodology`) permanently redirect into
the three tabs.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000, renders from seed JSON
npm run build      # static production build
```

## The trust layer

Every benchmark carries flags, rendered as badges and table tags:

- **Saturated** — top scores clustered; differences are near noise.
- **Contaminated** — known eval-set leakage.
- **Scaffold-dependent** — score reflects the harness as much as the model.
- **Vendor-reported** vs **Independent** — the source is always labeled.

The **Honest view** filter (`/benchmarks`) shows only contamination-resistant
*and* independent benchmarks.

## Daily refresh (live data)

`scripts/update.ts` scrapes a fixed set of source leaderboards, then merges the
result into `data/benchmarks.json`:

| Source | Scraped | Feeds |
|---|---|---|
| [Artificial Analysis](https://artificialanalysis.ai) | yes | coding + reasoning + math + multimodal rows |
| [LLM-Stats](https://llm-stats.com) | yes | reasoning + knowledge + math rows |
| [Steel](https://leaderboard.steel.dev) | yes | browser-agent + computer-use rows |
| Agent Arena, LMArena, SWE-bench | no | link-out cards on `/` only |

For each scraped source it fetches the page, reduces it to visible text, and
asks Claude to return score rows in the existing schema (**JSON only**). Only
rows that map to a known benchmark **and** a known model are merged. Benchmark
definitions are never dropped, any benchmark marked `"locked": true` is skipped,
and the process **exits 0 even if a source fails** (partial refresh is fine).

Run the pure-function checks without network or a key:

```bash
npx tsx scripts/update.ts --selfcheck
```

To wire it up:

1. Add repo secret `ANTHROPIC_API_KEY` (Settings → Secrets and variables → Actions).
2. `.github/workflows/update.yml` runs daily at 06:00 UTC (and via **Run workflow**).
3. Changes are auto-committed; Vercel redeploys on push.

> Scheduled Actions only run on the **default branch**. Merge there before
> expecting the cron to fire.
>
> If a source page turns out to be fully client-rendered, a plain fetch may
> return an empty shell — swap that source's URL for its JSON API endpoint in
> `SOURCES`. The parse/merge path stays the same.

## Data model

`data/benchmarks.json` = `{ meta, models[], benchmarks[], scores[] }`, kept
normalized so one model shows across all benchmarks and one benchmark across all
models without duplication. See [`lib/types.ts`](lib/types.ts) for the exact
shapes. To pin a manually-curated benchmark against the refresh, set
`"locked": true` on it.

## Deploy to Vercel

Import the repo at [vercel.com/new](https://vercel.com/new) — the framework is
auto-detected, no configuration needed. Every push to the default branch
redeploys.
