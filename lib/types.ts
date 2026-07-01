// Shape of /data/benchmarks.json. Kept normalized: models, benchmarks, and
// scores are separate so one model shows across all benchmarks and one
// benchmark across all models without duplication.

export type Category =
  | "Coding / Software Engineering"
  | "Browser Agents"
  | "Computer Use"
  | "Tool Use / Orchestration"
  | "Reasoning / Knowledge"
  | "Math"
  | "Multimodal"
  | "Knowledge Work"
  | "Deep Research";

export const CATEGORIES: Category[] = [
  "Coding / Software Engineering",
  "Browser Agents",
  "Computer Use",
  "Tool Use / Orchestration",
  "Reasoning / Knowledge",
  "Math",
  "Multimodal",
  "Knowledge Work",
  "Deep Research",
];

export type Flag =
  | "saturated"
  | "contaminated"
  | "scaffold-dependent"
  | "vendor-reported"
  | "independent";

export type Scaffold = "model" | "system" | "mixed";

export interface Benchmark {
  id: string;
  name: string;
  category: Category;
  measures: string;
  taskCount: number | null;
  liveOrStatic: "live" | "static";
  contaminationResistant: boolean;
  scaffold: Scaffold;
  maintainer: string;
  sourceUrl: string;
  humanBaseline: number | null;
  saturated: boolean;
  flags: Flag[];
  lastUpdated: string; // ISO date
  locked?: boolean; // if true, the refresh script skips it
}

export interface Model {
  id: string;
  name: string;
  vendor: string;
  openWeights: boolean;
  notes: string | null;
}

export interface Score {
  benchmarkId: string;
  modelId: string;
  score: number; // %
  rank: number | null;
  source: "vendor" | "independent";
  sourceUrl: string;
  asOf: string; // ISO date
}

export interface SourceRef {
  name: string;
  measures: string;
  url: string;
}

export interface Meta {
  title: string;
  caveat: string;
  lastUpdated: string; // ISO date
  dataSources: SourceRef[]; // scraped daily by scripts/update.ts
  linkOuts: SourceRef[]; // referenced only, never scraped or re-ranked
}

export interface BenchmarkData {
  meta: Meta;
  models: Model[];
  benchmarks: Benchmark[];
  scores: Score[];
}
