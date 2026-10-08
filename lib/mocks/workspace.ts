import type { ActionAlert } from "@/domain/actions";
import type { InventoryRecord, InventorySummary } from "@/domain/inventory";
import type { PricingRow } from "@/domain/pricing";
import type { Channel, Gram, InventoryDecision } from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import type { SupplierQuoteRow } from "@/domain/suppliers";

const EXCLUDED_STATUSES = [
  "RESERVED",
  "ALLOCATED",
  "INCOMING",
  "IN_TRANSIT",
  "BLOCKED",
  "QC",
  "UNAVAILABLE",
  "SOLD",
  "ALREADY_SOLD",
  "PO",
  "QC_EXCEPTION",
  "EXCEPTION",
  "INCOMING_PO",
  "HOLD_BUFFER",
] as const;

const SNAPSHOT_AT = "2026-10-07T11:00:00.000Z";

function pad(value: number, width: number) {
  return String(value).padStart(width, "0");
}

function sellingPrice(channel: Channel, gram: Gram) {
  return gram * (channel === "B2C" ? 2_570_000 : 2_540_000);
}

function antamPrice(gram: Gram) {
  return gram * 2_570_000;
}

function profitFrom(cost: number, purchase: number, marketBuy: number, marketSale: number, selling: number | null) {
  return {
    prognosa: marketBuy - purchase,
    investment: marketSale - marketBuy,
    arbitrage: selling == null ? null : selling - marketSale,
    total: selling == null ? null : selling - cost,
  };
}

function makeRecord(input: {
  index: number;
  gram: Gram;
  channel: Channel;
  costRatio: number;
  status?: string;
  reserved?: boolean;
  decision?: InventoryDecision | null;
  action?: string | null;
  supplier?: InventoryRecord["supplier"];
  valid?: boolean;
  reason?: string | null;
}): InventoryRecord {
  const selling = input.valid === false ? null : sellingPrice(input.channel, input.gram);
  const unitCost = Math.round(sellingPrice(input.channel, input.gram) * input.costRatio);
  const marketSale = antamPrice(input.gram);
  const marketBuy = input.gram * 2_520_000;
  const gp = selling == null ? null : selling - unitCost;
  const margin = selling && gp != null ? (gp / selling) * 100 : null;
  const ready =
    input.valid !== false &&
    !input.reserved &&
    (input.status ?? "READY") === "READY";

  return {
    stockId: `STK-${pad(input.index, 5)}`,
    serial: `GMI-${pad(input.index, 6)}`,
    gram: input.gram,
    channel: input.channel,
    availabilityStatus: input.status ?? "READY",
    reserved: Boolean(input.reserved),
    unitCost,
    purchasePrice: unitCost,
    sellingPrice: ready ? selling : selling,
    directGp: ready ? gp : null,
    directMargin: ready ? margin : null,
    decision: ready ? (input.decision ?? "SELL READY") : null,
    recommendedAction:
      input.action ??
      (input.decision === "HOLD"
        ? "REPRICE"
        : input.decision === "ROUTE ELIGIBLE"
          ? "WATCH"
          : input.decision === "SELL READY"
            ? "SELL READY"
            : "REVIEW"),
    production: "2026",
    stockKeeper: "Vault Jakarta",
    marketAtPurchase: marketBuy,
    marketAtSale: marketSale,
    profit: profitFrom(unitCost, unitCost, marketBuy, marketSale, selling),
    reason: input.reason ?? null,
    supplier: input.supplier ?? null,
    policyMargin: input.channel === "B2C" ? 3 : 2.5,
    valid: input.valid !== false,
    ready,
  };
}

function buildInventory(): InventoryRecord[] {
  const rows: InventoryRecord[] = [];
  let index = 1;
  const sellCounts: Record<Gram, number> = {
    1: 8,
    2: 6,
    3: 6,
    5: 6,
    10: 10,
    25: 8,
    50: 4,
    100: 4,
  };

  for (const gram of GRAMS) {
    for (let i = 0; i < sellCounts[gram]; i += 1) {
      const channel: Channel = gram >= 50 && i === 0 ? "B2B" : "B2C";
      rows.push(
        makeRecord({
          index: index++,
          gram,
          channel,
          costRatio: channel === "B2B" ? 0.975 : 0.97,
          decision: "SELL READY",
          reason:
            channel === "B2B"
              ? "Margin 2.50% ≥ policy 2.50%"
              : "Margin 3.00% ≥ policy 3.00%",
        }),
      );
    }
  }

  for (let i = 0; i < 16; i += 1) {
    rows.push(
      makeRecord({
        index: index++,
        gram: 10,
        channel: "B2C",
        costRatio: 0.993,
        decision: "ROUTE ELIGIBLE",
        action: "WATCH",
        supplier: { name: "SIMA", quotePrice: Math.round(sellingPrice("B2C", 10) * (1 - 0.0182)) },
        reason: "Replacement profitable · WATCH until demand",
      }),
    );
  }

  for (let i = 0; i < 43; i += 1) {
    rows.push(
      makeRecord({
        index: index++,
        gram: 25,
        channel: "B2C",
        costRatio: 0.993,
        decision: "ROUTE ELIGIBLE",
        action: "WATCH",
        supplier: { name: "KRISNA", quotePrice: Math.round(sellingPrice("B2C", 25) * (1 - 0.0183)) },
        reason: "Replacement profitable · WATCH until demand",
      }),
    );
  }

  rows.push(
    makeRecord({
      index: index++,
      gram: 50,
      channel: "B2C",
      costRatio: 0.9898,
      decision: "HOLD",
      action: "REPRICE",
      reason: "Margin below B2C policy floor 3.00%",
    }),
    makeRecord({
      index: index++,
      gram: 100,
      channel: "B2C",
      costRatio: 1.004,
      decision: "HOLD",
      action: "REPRICE",
      reason: "Selling price below unit cost",
    }),
  );

  for (const status of EXCLUDED_STATUSES) {
    rows.push(
      makeRecord({
        index: index++,
        gram: GRAMS[(index - 1) % GRAMS.length],
        channel: "B2C",
        costRatio: 0.95,
        status,
        reserved: status === "RESERVED",
        decision: null,
        action: "REVIEW",
        reason: "Reserved, incoming, sold dan non-ready",
      }),
    );
  }

  rows.push({
    ...makeRecord({
      index: index++,
      gram: 10,
      channel: "B2C",
      costRatio: 0.95,
      valid: false,
      decision: null,
      action: "REVIEW DATA",
      reason: "gramasi invalid",
    }),
    gram: 10,
    unitCost: -1,
    valid: false,
    ready: false,
    sellingPrice: null,
    directGp: null,
    directMargin: null,
  });

  return rows;
}

const INVENTORY = buildInventory();

export function getInventoryRecords(): InventoryRecord[] {
  return INVENTORY;
}

export function getInventoryRecord(stockId: string): InventoryRecord | undefined {
  return INVENTORY.find((row) => row.stockId === stockId);
}

export function getInventorySummary(): InventorySummary {
  const ready = INVENTORY.filter((row) => row.ready && row.valid);
  const invalid = INVENTORY.filter((row) => !row.valid);
  const unpriced = ready.filter((row) => row.sellingPrice == null);

  return {
    readyGrams: ready.reduce((sum, row) => sum + row.gram, 0),
    readyPcs: ready.length,
    invalidPcs: invalid.length,
    unpricedPcs: unpriced.length,
  };
}

export function getPricingRows(): PricingRow[] {
  const rows: PricingRow[] = [];

  for (const channel of ["B2C", "B2B"] as const) {
    for (const gram of GRAMS) {
      const units = INVENTORY.filter(
        (row) => row.ready && row.channel === channel && row.gram === gram,
      );
      const cost = units.length
        ? Math.max(...units.map((row) => row.unitCost))
        : null;
      const pricelist = sellingPrice(channel, gram);
      const antam = antamPrice(gram);
      const policy = channel === "B2C" ? 3 : 2.5;
      const margin =
        cost != null ? ((pricelist - cost) / pricelist) * 100 : null;
      const quote =
        gram === 10
          ? { name: "SIMA", price: Math.round(pricelist * (1 - 0.0182)) }
          : gram === 25
            ? { name: "KRISNA", price: Math.round(pricelist * (1 - 0.0183)) }
            : null;

      let recommendation: PricingRow["recommendation"] = "Unavailable";
      if (margin != null) {
        recommendation =
          margin >= policy ? "OK" : margin >= 0 ? "THIN / REPRICE" : "REPRICE";
      }

      rows.push({
        channel,
        gram,
        pricelist,
        antam,
        gapVsAntam: ((pricelist / antam - 1) * 100),
        supplierLabel: quote
          ? `${quote.name} · Rp${quote.price.toLocaleString("id-ID")}`
          : "Unavailable",
        minProfitable: cost,
        targetMarginPrice: cost == null ? null : cost / (1 - policy / 100),
        policy,
        recommendation,
      });
    }
  }

  return rows;
}

function quoteValidUntil(quoteTime: string) {
  return new Date(
    new Date(quoteTime).getTime() + 24 * 60 * 60 * 1000,
  ).toISOString();
}

export function getSupplierQuotes(): SupplierQuoteRow[] {
  return [
    {
      quoteId: "Q-SIMA-10",
      supplierId: "SIMA",
      name: "SIMA",
      active: true,
      gram: 10,
      quotePrice: Math.round(sellingPrice("B2C", 10) * (1 - 0.0182)),
      capacity: 160,
      leadTime: 8,
      quoteTime: SNAPSHOT_AT,
      validUntil: quoteValidUntil(SNAPSHOT_AT),
      lockAvailable: true,
      lockStatus: "UNLOCKED",
    },
    {
      quoteId: "Q-KRISNA-25",
      supplierId: "KRISNA",
      name: "KRISNA",
      active: true,
      gram: 25,
      quotePrice: Math.round(sellingPrice("B2C", 25) * (1 - 0.0183)),
      capacity: 1075,
      leadTime: 8,
      quoteTime: SNAPSHOT_AT,
      validUntil: quoteValidUntil(SNAPSHOT_AT),
      lockAvailable: true,
      lockStatus: "UNLOCKED",
    },
  ];
}

export function getActionAlerts(): ActionAlert[] {
  const watch10 = INVENTORY.filter(
    (row) =>
      row.decision === "ROUTE ELIGIBLE" &&
      row.channel === "B2C" &&
      row.gram === 10,
  );
  const watch25 = INVENTORY.filter(
    (row) =>
      row.decision === "ROUTE ELIGIBLE" &&
      row.channel === "B2C" &&
      row.gram === 25,
  );
  const quotes = getSupplierQuotes();
  const sima = quotes.find((quote) => quote.name === "SIMA");
  const krisna = quotes.find((quote) => quote.name === "KRISNA");

  return [
    {
      id: "WATCH-B2C-10",
      severity: "attention",
      action: "WATCH",
      channel: "B2C",
      gram: 10,
      quantity: watch10.length,
      grams: watch10.length * 10,
      reasonKey: "watch10",
      status: "OPEN",
      createdAt: SNAPSHOT_AT,
      supplier:
        sima && sima.quotePrice != null
          ? {
              name: sima.name,
              quotePrice: sima.quotePrice,
              capacity: sima.capacity,
              leadTime: sima.leadTime,
            }
          : null,
    },
    {
      id: "WATCH-B2C-25",
      severity: "attention",
      action: "WATCH",
      channel: "B2C",
      gram: 25,
      quantity: watch25.length,
      grams: watch25.length * 25,
      reasonKey: "watch25",
      status: "OPEN",
      createdAt: SNAPSHOT_AT,
      supplier:
        krisna && krisna.quotePrice != null
          ? {
              name: krisna.name,
              quotePrice: krisna.quotePrice,
              capacity: krisna.capacity,
              leadTime: krisna.leadTime,
            }
          : null,
    },
  ];
}
