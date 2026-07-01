import raw from "@/data/benchmarks.json";
import type {
  Benchmark,
  BenchmarkData,
  Category,
  Model,
  Score,
} from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

// Single typed handle on the static JSON. No network, no server route.
const data = raw as BenchmarkData;

export const meta = data.meta;
export const models: Model[] = data.models;
export const benchmarks: Benchmark[] = data.benchmarks;
export const scores: Score[] = data.scores;

const benchmarkById = new Map(benchmarks.map((b) => [b.id, b]));
const modelById = new Map(models.map((m) => [m.id, m]));

export const getBenchmark = (id: string) => benchmarkById.get(id);
export const getModel = (id: string) => modelById.get(id);

export const scoresForBenchmark = (benchmarkId: string): Score[] =>
  scores
    .filter((s) => s.benchmarkId === benchmarkId)
    .sort((a, b) => b.score - a.score);

export const scoresForModel = (modelId: string): Score[] =>
  scores.filter((s) => s.modelId === modelId);

export interface Leader {
  score: Score;
  model: Model | undefined;
}

// Top score for a benchmark, resolved to its model.
export const leaderFor = (benchmarkId: string): Leader | null => {
  const top = scoresForBenchmark(benchmarkId)[0];
  if (!top) return null;
  return { score: top, model: getModel(top.modelId) };
};

export interface CategoryGroup {
  category: Category;
  benchmarks: Benchmark[];
}

export const byCategory = (): CategoryGroup[] =>
  CATEGORIES.map((category) => ({
    category,
    benchmarks: benchmarks.filter((b) => b.category === category),
  })).filter((g) => g.benchmarks.length > 0);

// Rows for the master table: every score joined to its benchmark + model.
export interface ScoreRow {
  benchmarkId: string;
  benchmarkName: string;
  category: Category;
  modelId: string;
  modelName: string;
  vendor: string;
  score: number;
  rank: number | null;
  source: "vendor" | "independent";
  sourceUrl: string;
  asOf: string;
  contaminationResistant: boolean;
  saturated: boolean;
}

export const scoreRows = (): ScoreRow[] =>
  scores.map((s) => {
    const b = getBenchmark(s.benchmarkId);
    const m = getModel(s.modelId);
    return {
      benchmarkId: s.benchmarkId,
      benchmarkName: b?.name ?? s.benchmarkId,
      category: (b?.category ?? "Reasoning / Knowledge") as Category,
      modelId: s.modelId,
      modelName: m?.name ?? s.modelId,
      vendor: m?.vendor ?? "Unknown",
      score: s.score,
      rank: s.rank,
      source: s.source,
      sourceUrl: s.sourceUrl,
      asOf: s.asOf,
      contaminationResistant: b?.contaminationResistant ?? false,
      saturated: b?.saturated ?? false,
    };
  });

// Models that actually have at least one score (for /models index + static params).
export const scoredModels = (): Model[] => {
  const ids = new Set(scores.map((s) => s.modelId));
  return models.filter((m) => ids.has(m.id));
};

// Agent Arena and similar report Elo/ratings, not percentages. Anything
// clearly above 100 is a rating, so we render the unit accordingly.
export const isPercent = (score: number) => score <= 100;

export const formatScore = (score: number): string =>
  isPercent(score) ? `${score.toFixed(1)}%` : Math.round(score).toString();
