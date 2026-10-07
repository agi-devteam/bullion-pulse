import type { Channel, Gram } from "@/domain/primitives";

export type PricingRecommendation = "OK" | "THIN / REPRICE" | "REPRICE" | "Unavailable";

export interface PricingRow {
  channel: Channel;
  gram: Gram;
  pricelist: number | null;
  antam: number | null;
  gapVsAntam: number | null;
  supplierLabel: string;
  minProfitable: number | null;
  targetMarginPrice: number | null;
  policy: number;
  recommendation: PricingRecommendation;
}
