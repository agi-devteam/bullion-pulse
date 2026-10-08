import type { HomeIntelligence } from "@/domain/intelligence";
import type { Segment } from "@/domain/primitives";

const ALL: HomeIntelligence = {
  isComplete: true,
  snapshotDate: "2026-10-07",
  invalidCount: 1,
  excludedPcs: 14,
  unpricedPcs: 0,
  marketAvgAtPurchase: 2_520_000,
  marketAvgNow: 2_570_000,
  grams: 18254,
  pcs: 2674,
  profit: {
    prognosa: 447_300_250,
    investment: 912_700_000,
    arbitrage: -67_500_000,
    total: 1_292_500_250,
  },
  split: { sell: 92.4, route: 6.8, hold: 0.8 },
  buckets: {
    sell: {
      grams: 16869,
      pcs: 2614,
      profit: {
        prognosa: 494_049_900,
        investment: 843_450_000,
        arbitrage: -67_500_000,
        total: 1_269_999_900,
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
      evidenceRows: [
        { channel: "B2C", gram: 1, qty: 449, reason: "Margin 3.00% ≥ policy 3.00%" },
        { channel: "B2C", gram: 2, qty: 400, reason: "Margin 3.00% ≥ policy 3.00%" },
        { channel: "B2C", gram: 3, qty: 560, reason: "Margin 3.00% ≥ policy 3.00%" },
        { channel: "B2C", gram: 5, qty: 640, reason: "Margin 3.00% ≥ policy 3.00%" },
        { channel: "B2C", gram: 10, qty: 409, reason: "Margin 3.00% ≥ policy 3.00%" },
        { channel: "B2C", gram: 25, qty: 100, reason: "Margin 3.00% ≥ policy 3.00%" },
        { channel: "B2C", gram: 50, qty: 22, reason: "Margin 3.00% ≥ policy 3.00%" },
        { channel: "B2B", gram: 50, qty: 5, reason: "Margin 2.50% ≥ policy 2.50%" },
        { channel: "B2C", gram: 100, qty: 8, reason: "Margin 3.00% ≥ policy 3.00%" },
        { channel: "B2B", gram: 100, qty: 20, reason: "Margin 2.50% ≥ policy 2.50%" },
      ],
    },
    route: {
      grams: 1235,
      pcs: 59,
      profit: {
        prognosa: -39_532_350,
        investment: 61_750_000,
        arbitrage: 0,
        total: 22_217_650,
      },
      denominations: [
        { gram: 1, grams: 0 },
        { gram: 10, grams: 160 },
        { gram: 25, grams: 1075 },
      ],
      evidenceRows: [
        {
          channel: "B2C",
          gram: 10,
          qty: 16,
          reason: "Existing margin 0.70%; replacement 1.82%. Waiting for demand.",
        },
        {
          channel: "B2C",
          gram: 25,
          qty: 43,
          reason: "Existing margin 0.70%; replacement 1.83%. Waiting for demand.",
        },
      ],
    },
    hold: {
      grams: 150,
      pcs: 2,
      profit: {
        prognosa: -7_217_300,
        investment: 7_500_000,
        arbitrage: 0,
        total: 282_700,
      },
      denominations: [
        { gram: 50, grams: 50 },
        { gram: 100, grams: 100 },
      ],
      evidenceRows: [
        {
          channel: "B2C",
          gram: 50,
          qty: 1,
          reason: "Margin 1.02% di bawah policy 3.00%; tidak ada replacement viable.",
        },
        {
          channel: "B2C",
          gram: 100,
          qty: 1,
          reason: "Margin -0.40% di bawah policy 3.00%; tidak ada replacement viable.",
        },
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
    excludedPcs: Math.max(1, Math.round(base.excludedPcs * factor)),
    unpricedPcs: Math.round(base.unpricedPcs * factor),
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
        evidenceRows: base.buckets.sell.evidenceRows.map((row) => ({
          ...row,
          qty: Math.max(1, Math.round(row.qty * factor)),
        })),
      },
      route: {
        ...base.buckets.route,
        grams: Math.round(base.buckets.route.grams * factor),
        pcs: Math.round(base.buckets.route.pcs * factor),
        profit: {
          prognosa: scaleAmount(base.buckets.route.profit.prognosa, factor),
          investment: scaleAmount(base.buckets.route.profit.investment, factor),
          arbitrage: scaleAmount(base.buckets.route.profit.arbitrage, factor),
          total: scaleAmount(base.buckets.route.profit.total, factor),
        },
        denominations: base.buckets.route.denominations.map((row) => ({
          ...row,
          grams: Math.round(row.grams * factor),
        })),
        evidenceRows: base.buckets.route.evidenceRows.map((row) => ({
          ...row,
          qty: Math.max(1, Math.round(row.qty * factor)),
        })),
      },
      hold: {
        ...base.buckets.hold,
        grams: Math.round(base.buckets.hold.grams * factor),
        pcs: Math.round(base.buckets.hold.pcs * factor),
        profit: {
          prognosa: scaleAmount(base.buckets.hold.profit.prognosa, factor),
          investment: scaleAmount(base.buckets.hold.profit.investment, factor),
          arbitrage: scaleAmount(base.buckets.hold.profit.arbitrage, factor),
          total: scaleAmount(base.buckets.hold.profit.total, factor),
        },
        denominations: base.buckets.hold.denominations.map((row) => ({
          ...row,
          grams: Math.round(row.grams * factor),
        })),
        evidenceRows: base.buckets.hold.evidenceRows.map((row) => ({
          ...row,
          qty: Math.max(1, Math.round(row.qty * factor)),
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
