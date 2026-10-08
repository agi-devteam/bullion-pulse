import type { HomeIntelligence } from "@/domain/intelligence";
import type { Segment } from "@/domain/primitives";

const ALL: HomeIntelligence = {
  isComplete: true,
  snapshotDate: "2026-10-07",
  invalidCount: 1,
  grams: 18254,
  pcs: 2674,
  profit: {
    prognosa: 447_300_000,
    investment: 912_700_000,
    arbitrage: -67_500_000,
    total: 1_292_500_000,
  },
  split: { sell: 92.4, route: 6.8, hold: 0.8 },
  buckets: {
    sell: {
      grams: 16869,
      pcs: 2614,
      profit: {
        prognosa: 494_000_000,
        investment: 870_000_000,
        arbitrage: -55_000_000,
        total: 1_309_000_000,
      },
      denominations: [
        { gram: 1, grams: 449 },
        { gram: 2, grams: 312 },
        { gram: 3, grams: 465 },
        { gram: 5, grams: 850 },
        { gram: 10, grams: 4090 },
        { gram: 25, grams: 2500 },
        { gram: 50, grams: 5403 },
        { gram: 100, grams: 2800 },
      ],
    },
    route: {
      grams: 1235,
      pcs: 59,
      profit: {
        prognosa: null,
        investment: null,
        arbitrage: null,
        total: null,
      },
      denominations: [
        { gram: 1, grams: 0 },
        { gram: 10, grams: 160 },
        { gram: 25, grams: 1075 },
      ],
    },
    hold: {
      grams: 150,
      pcs: 2,
      profit: {
        prognosa: null,
        investment: null,
        arbitrage: null,
        total: null,
      },
      denominations: [
        { gram: 50, grams: 50 },
        { gram: 100, grams: 100 },
      ],
    },
  },
  routeSuppliers: [
    { name: "SIMA", grams: 160 },
    { name: "KRISNA", grams: 1075 },
  ],
  policyFloor: { b2c: 3, b2b: 2.5 },
  actions: [
    {
      id: "watch-10g",
      action: "WATCH",
      titleKey: "watch10Title",
      subtitleKey: "watch10Subtitle",
      href: "/actions",
    },
    {
      id: "watch-25g",
      action: "WATCH",
      titleKey: "watch25Title",
      subtitleKey: "watch25Subtitle",
      href: "/actions",
    },
  ],
};

function scaleAmount(value: number | null, factor: number): number | null {
  if (value == null) {
    return null;
  }

  return Math.round(value * factor);
}

function scaleHomeIntelligence(
  base: HomeIntelligence,
  factor: number,
): HomeIntelligence {
  return {
    ...base,
    grams: Math.round(base.grams * factor),
    pcs: Math.round(base.pcs * factor),
    profit: {
      prognosa: scaleAmount(base.profit.prognosa, factor),
      investment: scaleAmount(base.profit.investment, factor),
      arbitrage: scaleAmount(base.profit.arbitrage, factor),
      total: scaleAmount(base.profit.total, factor),
    },
    buckets: {
      sell: {
        ...base.buckets.sell,
        grams: Math.round(base.buckets.sell.grams * factor),
        pcs: Math.round(base.buckets.sell.pcs * factor),
        profit: {
          prognosa: scaleAmount(base.buckets.sell.profit.prognosa, factor),
          investment: scaleAmount(base.buckets.sell.profit.investment, factor),
          arbitrage: scaleAmount(base.buckets.sell.profit.arbitrage, factor),
          total: scaleAmount(base.buckets.sell.profit.total, factor),
        },
        denominations: base.buckets.sell.denominations.map((row) => ({
          ...row,
          grams: Math.round(row.grams * factor),
        })),
      },
      route: {
        ...base.buckets.route,
        grams: Math.round(base.buckets.route.grams * factor),
        pcs: Math.round(base.buckets.route.pcs * factor),
        denominations: base.buckets.route.denominations.map((row) => ({
          ...row,
          grams: Math.round(row.grams * factor),
        })),
      },
      hold: {
        ...base.buckets.hold,
        grams: Math.round(base.buckets.hold.grams * factor),
        pcs: Math.round(base.buckets.hold.pcs * factor),
        denominations: base.buckets.hold.denominations.map((row) => ({
          ...row,
          grams: Math.round(row.grams * factor),
        })),
      },
    },
    routeSuppliers: base.routeSuppliers.map((supplier) => ({
      ...supplier,
      grams: Math.round(supplier.grams * factor),
    })),
  };
}

export function getHomeIntelligence(segment: Segment): HomeIntelligence {
  if (segment === "b2c") {
    return scaleHomeIntelligence(ALL, 0.62);
  }

  if (segment === "b2b") {
    return scaleHomeIntelligence(ALL, 0.38);
  }

  return ALL;
}
