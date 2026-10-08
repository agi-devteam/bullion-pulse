import type { Channel, DecisionBucket, Gram } from "@/domain/primitives";

export interface BucketProfit {
  prognosa: number | null;
  investment: number | null;
  arbitrage: number | null;
  total: number | null;
}

export interface BucketDenomination {
  gram: Gram | number;
  grams: number;
}

export interface BucketEvidenceRow {
  channel: Channel;
  gram: Gram | number;
  qty: number;
  reason: string;
}

export interface SupplierSplit {
  name: string;
  grams: number;
}

export interface BucketData {
  grams: number;
  pcs: number;
  profit: BucketProfit;
  denominations: BucketDenomination[];
  evidenceRows: BucketEvidenceRow[];
}

export type PriorityTitleKey = "watch10Title" | "watch25Title";

export type PrioritySubtitleKey = "watch10Subtitle" | "watch25Subtitle";

export interface PriorityAction {
  id: string;
  action: "WATCH";
  titleKey: PriorityTitleKey;
  subtitleKey: PrioritySubtitleKey;
  href: string;
}

export interface HomeIntelligence {
  isComplete: boolean;
  snapshotDate: string;
  invalidCount: number;
  excludedPcs: number;
  unpricedPcs: number;
  marketAvgAtPurchase: number;
  marketAvgNow: number;
  grams: number;
  pcs: number;
  profit: BucketProfit;
  split: Record<DecisionBucket, number>;
  buckets: Record<DecisionBucket, BucketData>;
  routeSuppliers: SupplierSplit[];
  policyFloor: { b2c: number; b2b: number };
  actions: PriorityAction[];
}

export const TONE_FILL_CLASS: Record<DecisionBucket, string> = {
  sell: "bg-sell-f",
  route: "bg-route-f",
  hold: "bg-hold-f",
};

export const TONE_DOT_CLASS: Record<DecisionBucket, string> = {
  sell: "bg-sell-f",
  route: "bg-route-f",
  hold: "bg-hold-f",
};
