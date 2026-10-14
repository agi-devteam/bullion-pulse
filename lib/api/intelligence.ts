import type {
  BucketData,
  BucketProfit,
  HomeIntelligence,
  HomeMarket,
  PriorityAction,
  SupplierSplit,
} from "@/domain/intelligence";
import type { DecisionBucket, Segment } from "@/domain/primitives";
import { apiGet } from "@/lib/api/http";

/** Live backend shape — `GET /intelligence/home`. */
export interface HomeIntelligenceDto {
  isComplete?: boolean;
  snapshotDate: string;
  segment?: Segment;
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

function emptyProfit(): BucketProfit {
  return {
    prognosa: null,
    investment: null,
    arbitrage: null,
    total: null,
  };
}

function emptyBucket(): BucketData {
  return {
    grams: 0,
    pcs: 0,
    profit: emptyProfit(),
    denominations: [],
    evidenceRows: [],
  };
}

function mapProfit(value: BucketProfit | null | undefined): BucketProfit {
  if (!value) return emptyProfit();
  return {
    prognosa: value.prognosa ?? null,
    investment: value.investment ?? null,
    arbitrage: value.arbitrage ?? null,
    total: value.total ?? null,
  };
}

function mapBucket(value: BucketData | null | undefined): BucketData {
  if (!value) return emptyBucket();
  return {
    grams: value.grams ?? 0,
    pcs: value.pcs ?? 0,
    profit: mapProfit(value.profit),
    denominations: Array.isArray(value.denominations)
      ? value.denominations
      : [],
    evidenceRows: Array.isArray(value.evidenceRows) ? value.evidenceRows : [],
  };
}

export function mapHomeIntelligence(
  dto: HomeIntelligenceDto,
): HomeIntelligence {
  return {
    isComplete: dto.isComplete ?? true,
    snapshotDate: dto.snapshotDate,
    invalidCount: dto.invalidCount ?? 0,
    excludedPcs: dto.excludedPcs ?? 0,
    unpricedPcs: dto.unpricedPcs ?? 0,
    marketAvgAtPurchase: dto.marketAvgAtPurchase ?? 0,
    marketAvgNow: dto.marketAvgNow ?? 0,
    grams: dto.grams ?? 0,
    pcs: dto.pcs ?? 0,
    profit: mapProfit(dto.profit),
    split: {
      sell: dto.split.sell,
      route: dto.split.route,
      hold: dto.split.hold,
    },
    buckets: {
      sell: mapBucket(dto.buckets.sell),
      route: mapBucket(dto.buckets.route),
      hold: mapBucket(dto.buckets.hold),
    },
    routeSuppliers: dto.routeSuppliers,
    policyFloor: {
      b2c: dto.policyFloor.b2c,
      b2b: dto.policyFloor.b2b,
    },
    actions: dto.actions,
    market: dto.market,
  };
}

export async function fetchHomeIntelligence(
  segment: Segment = "all",
): Promise<HomeIntelligence> {
  const params = new URLSearchParams({ segment });
  const dto = await apiGet<HomeIntelligenceDto>(
    `/intelligence/home?${params.toString()}`,
  );
  return mapHomeIntelligence(dto);
}
