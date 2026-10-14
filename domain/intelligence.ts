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

export interface PriorityAction {
  id: string;
  action: "WATCH";
  channel: Channel;
  gram: Gram;
  grams: number;
  replacementMargin: number | null;
  href: string;
}

/** Market strip quote — `change` is percent vs previous tick. */
export interface HomeMarketQuote {
  current: number;
  change: number | null;
}
export interface HomeMarket {
  xauEnabled: boolean;
  xau: HomeMarketQuote | null;
  antamSell1g: HomeMarketQuote | null;
  antamBuybackPerGram: HomeMarketQuote | null;
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
  market: HomeMarket | null;
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
