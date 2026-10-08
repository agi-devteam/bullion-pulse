import type { DecisionBucket } from "@/domain/primitives";

export type DeltaSentiment = "good-up" | "bad-up";

export function sentimentForBucket(bucket: DecisionBucket): DeltaSentiment {
  return bucket === "sell" ? "good-up" : "bad-up";
}

export type DeltaTone = "positive" | "negative" | "neutral";

export function toneForDelta(
  delta: number,
  sentiment: DeltaSentiment,
): DeltaTone {
  if (!Number.isFinite(delta) || delta === 0) {
    return "neutral";
  }

  const increased = delta > 0;
  if (sentiment === "good-up") {
    return increased ? "positive" : "negative";
  }
  return increased ? "negative" : "positive";
}

export const DELTA_TONE_TEXT_CLASS: Record<DeltaTone, string> = {
  positive: "text-sell-t",
  negative: "text-hold-t",
  neutral: "text-muted-text",
};

export const DELTA_TONE_BG_CLASS: Record<DeltaTone, string> = {
  positive: "bg-sell-bg text-sell-t",
  negative: "bg-hold-bg text-hold-t",
  neutral: "bg-track text-muted-text",
};

export const BUCKET_FLASH_CLASS: Record<DecisionBucket, string> = {
  sell: "dashboard-flash-sell",
  route: "dashboard-flash-route",
  hold: "dashboard-flash-hold",
};
