import type { InventoryRecord } from "@/domain/inventory";
import { unitGrossProfit } from "@/domain/inventory-economics";
import type {
  BucketData,
  BucketEvidenceRow,
  BucketProfit,
  HomeIntelligence,
  SupplierSplit,
} from "@/domain/intelligence";
import type {
  Channel,
  DecisionBucket,
  Gram,
  InventoryDecision,
  Segment,
} from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import type { PolicyDraft } from "@/domain/settings";

const BUCKET_BY_DECISION: Record<InventoryDecision, DecisionBucket> = {
  "SELL READY": "sell",
  "ROUTE ELIGIBLE": "route",
  HOLD: "hold",
};

const EMPTY_PROFIT: BucketProfit = {
  prognosa: null,
  investment: null,
  arbitrage: null,
  total: null,
};

function matchesSegment(channel: Channel, segment: Segment): boolean {
  if (segment === "all") return true;
  if (segment === "b2c") return channel === "B2C";
  return channel === "B2B";
}

function emptyBucket(): BucketData {
  return {
    grams: 0,
    pcs: 0,
    profit: { ...EMPTY_PROFIT },
    denominations: [],
    evidenceRows: [],
  };
}

function sumNullable(values: Array<number | null>): number | null {
  if (values.length === 0) return 0;
  const present = values.filter(
    (value): value is number => value != null && Number.isFinite(value),
  );
  if (present.length === 0) return null;
  return present.reduce((sum, value) => sum + value, 0);
}

function aggregateProfit(units: InventoryRecord[]): BucketProfit {
  return {
    prognosa: sumNullable(units.map((unit) => unit.profit.prognosa)),
    investment: sumNullable(units.map((unit) => unit.profit.investment)),
    arbitrage: sumNullable(units.map((unit) => unit.profit.arbitrage)),
    total: sumNullable(units.map((unit) => unitGrossProfit(unit))),
  };
}

function buildDenominations(
  units: InventoryRecord[],
): BucketData["denominations"] {
  const byGram = new Map<number, number>();
  for (const unit of units) {
    byGram.set(unit.gram, (byGram.get(unit.gram) ?? 0) + unit.gram);
  }
  return GRAMS.map((gram) => ({
    gram,
    grams: byGram.get(gram) ?? 0,
  }));
}

function buildEvidenceRows(units: InventoryRecord[]): BucketEvidenceRow[] {
  const grouped = new Map<string, BucketEvidenceRow>();

  for (const unit of units) {
    const reason = unit.reason ?? "—";
    const key = `${unit.channel}:${unit.gram}:${reason}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.qty += 1;
      continue;
    }
    grouped.set(key, {
      channel: unit.channel,
      gram: unit.gram,
      qty: 1,
      reason,
    });
  }

  return [...grouped.values()].sort((a, b) => {
    if (a.channel !== b.channel) return a.channel.localeCompare(b.channel);
    return Number(a.gram) - Number(b.gram);
  });
}

function buildRouteSuppliers(units: InventoryRecord[]): SupplierSplit[] {
  const byName = new Map<string, number>();
  for (const unit of units) {
    if (!unit.supplier) continue;
    byName.set(
      unit.supplier.name,
      (byName.get(unit.supplier.name) ?? 0) + unit.gram,
    );
  }
  return [...byName.entries()]
    .map(([name, grams]) => ({ name, grams }))
    .sort((a, b) => b.grams - a.grams);
}

function policyFloorFromDraft(policy: PolicyDraft | null | undefined): {
  b2c: number;
  b2b: number;
} {
  const minFor = (channel: Channel): number => {
    const byGram = policy?.margin.minimumMargin[channel];
    if (!byGram) return channel === "B2C" ? 3 : 2.5;
    let min = Number.POSITIVE_INFINITY;
    for (const gram of GRAMS) {
      const value = byGram[gram as Gram];
      if (typeof value === "number" && Number.isFinite(value)) {
        min = Math.min(min, value);
      }
    }
    return Number.isFinite(min) ? min : channel === "B2C" ? 3 : 2.5;
  };

  return { b2c: minFor("B2C"), b2b: minFor("B2B") };
}

function averageMarket(
  units: InventoryRecord[],
  pick: (unit: InventoryRecord) => number | null,
): number {
  const prices = units
    .map(pick)
    .filter((value): value is number => value != null && value > 0);
  if (prices.length === 0) return 0;
  return Math.round(
    prices.reduce((sum, value) => sum + value, 0) / prices.length,
  );
}

export interface BuildHomeIntelligenceInput {
  inventory: InventoryRecord[];
  policy: PolicyDraft | null | undefined;
  segment: Segment;
  now?: Date;
}

export function buildHomeIntelligence(
  input: BuildHomeIntelligenceInput,
): HomeIntelligence {
  const now = input.now ?? new Date();
  const scoped = input.inventory.filter((unit) =>
    matchesSegment(unit.channel, input.segment),
  );

  const invalid = scoped.filter((unit) => !unit.valid);
  const ready = scoped.filter((unit) => unit.valid && unit.ready);
  const unpriced = ready.filter((unit) => unit.sellingPrice == null);
  const decided = ready.filter(
    (unit) => unit.decision != null && unit.sellingPrice != null,
  );

  const byBucket: Record<DecisionBucket, InventoryRecord[]> = {
    sell: [],
    route: [],
    hold: [],
  };

  for (const unit of decided) {
    if (!unit.decision) continue;
    byBucket[BUCKET_BY_DECISION[unit.decision]].push(unit);
  }

  const buckets = {
    sell: {
      grams: byBucket.sell.reduce((sum, unit) => sum + unit.gram, 0),
      pcs: byBucket.sell.length,
      profit: aggregateProfit(byBucket.sell),
      denominations: buildDenominations(byBucket.sell),
      evidenceRows: buildEvidenceRows(byBucket.sell),
    },
    route: {
      grams: byBucket.route.reduce((sum, unit) => sum + unit.gram, 0),
      pcs: byBucket.route.length,
      profit: aggregateProfit(byBucket.route),
      denominations: buildDenominations(byBucket.route),
      evidenceRows: buildEvidenceRows(byBucket.route),
    },
    hold: {
      grams: byBucket.hold.reduce((sum, unit) => sum + unit.gram, 0),
      pcs: byBucket.hold.length,
      profit: aggregateProfit(byBucket.hold),
      denominations: buildDenominations(byBucket.hold),
      evidenceRows: buildEvidenceRows(byBucket.hold),
    },
  } satisfies Record<DecisionBucket, BucketData>;

  const grams = buckets.sell.grams + buckets.route.grams + buckets.hold.grams;
  const pcs = buckets.sell.pcs + buckets.route.pcs + buckets.hold.pcs;

  const split = {
    sell: grams ? Number(((buckets.sell.grams / grams) * 100).toFixed(1)) : 0,
    route: grams ? Number(((buckets.route.grams / grams) * 100).toFixed(1)) : 0,
    hold: grams ? Number(((buckets.hold.grams / grams) * 100).toFixed(1)) : 0,
  };

  return {
    isComplete: true,
    snapshotDate: now.toISOString().slice(0, 10),
    invalidCount: invalid.length,
    excludedPcs: invalid.length,
    unpricedPcs: unpriced.length,
    marketAvgAtPurchase: averageMarket(
      decided,
      (unit) => unit.marketAtPurchase,
    ),
    marketAvgNow: averageMarket(decided, (unit) => unit.marketAtSale),
    grams,
    pcs,
    profit: aggregateProfit(decided),
    split,
    buckets,
    routeSuppliers: buildRouteSuppliers(byBucket.route),
    policyFloor: policyFloorFromDraft(input.policy),
    actions: [],
  };
}

export function emptyHomeIntelligence(segment: Segment): HomeIntelligence {
  void segment;
  return {
    isComplete: false,
    snapshotDate: new Date().toISOString().slice(0, 10),
    invalidCount: 0,
    excludedPcs: 0,
    unpricedPcs: 0,
    marketAvgAtPurchase: 0,
    marketAvgNow: 0,
    grams: 0,
    pcs: 0,
    profit: { ...EMPTY_PROFIT },
    split: { sell: 0, route: 0, hold: 0 },
    buckets: {
      sell: emptyBucket(),
      route: emptyBucket(),
      hold: emptyBucket(),
    },
    routeSuppliers: [],
    policyFloor: { b2c: 3, b2b: 2.5 },
    actions: [],
  };
}
