import type { DecisionBucket, Gram } from "@/domain/primitives";

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

export interface SupplierSplit {
  name: string;
  grams: number;
}

export interface BucketData {
  grams: number;
  pcs: number;
  profit: BucketProfit;
  denominations: BucketDenomination[];
}

export interface PriorityAction {
  id: string;
  action: "WATCH" | "REPRICE";
  title: string;
  subtitle: string;
  href: string;
}

export interface HomeIntelligence {
  isComplete: boolean;
  snapshotDate: string;
  invalidCount: number;
  grams: number;
  pcs: number;
  profit: BucketProfit;
  split: Record<DecisionBucket, number>;
  buckets: Record<DecisionBucket, BucketData>;
  routeSuppliers: SupplierSplit[];
  policyFloor: { b2c: number; b2b: number };
  actions: PriorityAction[];
}

export const BUCKET_EVIDENCE_TITLE: Record<DecisionBucket, string> = {
  sell: "SELL READY · Evidence",
  route: "ROUTE ELIGIBLE · Evidence",
  hold: "HOLD · Evidence",
};

export const DECISION_CAPTIONS: Record<DecisionBucket, string> = {
  sell: "Ready to sell",
  route: "Route eligible",
  hold: "Protect margin",
};

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
