import type { InventoryRecord } from "@/domain/inventory";
import type { Channel, Gram } from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import type { PricingRecommendation, PricingRow } from "@/domain/pricing";
import type { MarginPolicy } from "@/domain/settings";
import type { SupplierQuoteRow } from "@/domain/suppliers";
import type {
  AntamPricelistEntry,
  PricelistEntry,
} from "@/lib/api/pricelists";
import { formatIdr } from "@/lib/format/money";

const CHANNELS: Channel[] = ["B2C", "B2B"];

function priceKey(channel: Channel, gram: Gram): string {
  return `${channel}:${gram}`;
}

function maxReadyUnitCost(
  inventory: InventoryRecord[],
  channel: Channel,
  gram: Gram,
): number | null {
  let max: number | null = null;
  for (const row of inventory) {
    if (!row.ready || !row.valid) continue;
    if (row.channel !== channel || row.gram !== gram) continue;
    if (!(row.unitCost > 0)) continue;
    max = max == null ? row.unitCost : Math.max(max, row.unitCost);
  }
  return max;
}

function bestSupplierForGram(
  suppliers: SupplierQuoteRow[],
  gram: Gram,
): SupplierQuoteRow | null {
  const now = Date.now();
  let best: SupplierQuoteRow | null = null;

  for (const quote of suppliers) {
    if (!quote.active) continue;
    if (quote.gram !== gram) continue;
    if (quote.quotePrice == null || !Number.isFinite(quote.quotePrice)) continue;
    if (quote.capacity < 0) continue;

    if (quote.validUntil) {
      const until = new Date(quote.validUntil).getTime();
      if (Number.isFinite(until) && until < now) continue;
    }

    if (!best || quote.quotePrice < (best.quotePrice ?? Number.POSITIVE_INFINITY)) {
      best = quote;
    }
  }

  return best;
}

function recommendationFor(
  pricelist: number | null,
  cost: number | null,
  policy: number,
): PricingRecommendation {
  if (pricelist == null || !(pricelist > 0) || cost == null) {
    return "Unavailable";
  }

  const margin = ((pricelist - cost) / pricelist) * 100;
  if (margin >= policy) return "OK";
  if (margin >= 0) return "THIN / REPRICE";
  return "REPRICE";
}

function gapVsAntam(
  pricelist: number | null,
  antam: number | null,
): number | null {
  if (pricelist == null || antam == null || !(antam > 0)) return null;
  return (pricelist / antam - 1) * 100;
}

export interface BuildPricingRowsInput {
  pricelists: PricelistEntry[];
  antam: AntamPricelistEntry[];
  inventory: InventoryRecord[];
  margin: MarginPolicy | null | undefined;
  suppliers: SupplierQuoteRow[];
}

export function buildPricingRows(input: BuildPricingRowsInput): PricingRow[] {
  const priceByKey = new Map<string, number>();
  for (const entry of input.pricelists) {
    priceByKey.set(priceKey(entry.channel, entry.gram), entry.price);
  }

  const antamByGram = new Map<Gram, number>();
  for (const entry of input.antam) {
    antamByGram.set(entry.gram, entry.sellPrice);
  }

  const rows: PricingRow[] = [];

  for (const channel of CHANNELS) {
    for (const gram of GRAMS) {
      const pricelist = priceByKey.get(priceKey(channel, gram)) ?? null;
      const antam = antamByGram.get(gram) ?? null;
      const cost = maxReadyUnitCost(input.inventory, channel, gram);
      const policy =
        input.margin?.minimumMargin[channel]?.[gram] ??
        (channel === "B2C" ? 3 : 2.5);
      const supplier = bestSupplierForGram(input.suppliers, gram);

      rows.push({
        channel,
        gram,
        pricelist,
        antam,
        gapVsAntam: gapVsAntam(pricelist, antam),
        supplierLabel: supplier
          ? `${supplier.name} · ${formatIdr(supplier.quotePrice)}`
          : "Unavailable",
        minProfitable: cost,
        targetMarginPrice:
          cost == null || policy >= 100 ? null : cost / (1 - policy / 100),
        policy,
        recommendation: recommendationFor(pricelist, cost, policy),
      });
    }
  }

  return rows;
}
