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
    stock_id: `STK-${pad(input.index, 5)}`,
    serial: `GMI-${pad(input.index, 6)}`,
    gram: input.gram,
    channel: input.channel,
    availability_status: input.status ?? "READY",
    reserved: Boolean(input.reserved),
    unit_cost: unitCost,
    purchase_price: unitCost,
    selling_price: ready ? selling : selling,
    direct_gp: ready ? gp : null,
    direct_margin: ready ? margin : null,
    decision: ready ? (input.decision ?? "SELL READY") : null,
    recommended_action: input.action ?? (input.decision === "HOLD" ? "REPRICE" : input.decision === "ROUTE ELIGIBLE" ? "WATCH" : "HOLD / WAIT"),
    production: "2026",
    stock_keeper: "Vault Jakarta",
    market_at_purchase: marketBuy,
    market_at_sale: marketSale,
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
        supplier: { name: "SIMA", quote_price: Math.round(sellingPrice("B2C", 10) * (1 - 0.0182)) },
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
        supplier: { name: "KRISNA", quote_price: Math.round(sellingPrice("B2C", 25) * (1 - 0.0183)) },
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
    unit_cost: -1,
    valid: false,
    ready: false,
    selling_price: null,
    direct_gp: null,
    direct_margin: null,
  });

  return rows;
}

const INVENTORY = buildInventory();

export function getInventoryRecords(): InventoryRecord[] {
  return INVENTORY;
}

export function getInventoryRecord(stockId: string): InventoryRecord | undefined {
  return INVENTORY.find((row) => row.stock_id === stockId);
}

export function getInventorySummary(): InventorySummary {
  const ready = INVENTORY.filter((row) => row.ready && row.valid);
  const excluded = INVENTORY.filter((row) => row.valid && !row.ready);
  const invalid = INVENTORY.filter((row) => !row.valid);
  const unpriced = ready.filter((row) => row.selling_price == null);

  return {
    readyGrams: ready.reduce((sum, row) => sum + row.gram, 0),
    readyPcs: ready.length,
    excludedPcs: excluded.length,
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
        ? Math.max(...units.map((row) => row.unit_cost))
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
      quote_id: "Q-SIMA-10",
      name: "SIMA",
      active: true,
      gram: 10,
      quote_price: Math.round(sellingPrice("B2C", 10) * (1 - 0.0182)),
      capacity: 160,
      lead_time: 8,
      quote_time: SNAPSHOT_AT,
      valid_until: quoteValidUntil(SNAPSHOT_AT),
      lock_available: true,
      lock_status: "UNLOCKED",
    },
    {
      quote_id: "Q-KRISNA-25",
      name: "KRISNA",
      active: true,
      gram: 25,
      quote_price: Math.round(sellingPrice("B2C", 25) * (1 - 0.0183)),
      capacity: 1075,
      lead_time: 8,
      quote_time: SNAPSHOT_AT,
      valid_until: quoteValidUntil(SNAPSHOT_AT),
      lock_available: true,
      lock_status: "UNLOCKED",
    },
  ];
}

export const SUPPLIER_DIRECTORY = [
  "ANTAM",
  "SIMA",
  "STARGOLD",
  "KRISNA",
  "SUTRISNO",
] as const;

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
        sima && sima.quote_price != null
          ? {
              name: sima.name,
              quotePrice: sima.quote_price,
              capacity: sima.capacity,
              leadTime: sima.lead_time,
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
        krisna && krisna.quote_price != null
          ? {
              name: krisna.name,
              quotePrice: krisna.quote_price,
              capacity: krisna.capacity,
              leadTime: krisna.lead_time,
            }
          : null,
    },
  ];
}
