import type { DecisionBucket, Segment } from "@/domain/primitives";
import type { InventoryFilters, PricingFilters } from "@/domain/filters";

export const queryKeys = {
  intelligence: {
    all: ["intelligence"] as const,
    bySegment: (segment: Segment) => ["intelligence", segment] as const,
    evidence: (bucket: DecisionBucket, segment: Segment) =>
      ["intelligence", "evidence", bucket, segment] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    list: (filters: InventoryFilters) => ["inventory", filters] as const,
  },
  market: {
    antam: ["market", "antam"] as const,
    xau: ["market", "xau"] as const,
  },
  pricing: {
    all: ["pricing"] as const,
    list: (filters: PricingFilters) => ["pricing", filters] as const,
  },
  suppliers: ["suppliers"] as const,
  actions: ["actions"] as const,
  settings: ["settings"] as const,
} as const;
