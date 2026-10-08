import type { InventoryRecord, InventorySupplierRef } from "@/domain/inventory";
import type { InventoryDecision } from "@/domain/primitives";
import type {
  MarginPolicy,
  PolicyDraft,
  RoutePolicy,
} from "@/domain/settings";
import type { SupplierQuoteRow } from "@/domain/suppliers";

export type RecommendedAction = "SELL READY" | "WATCH" | "REPRICE" | "WAIT";

export interface UnitDecision {
  decision: InventoryDecision;
  recommendedAction: RecommendedAction;
  reason: string;
  supplier: InventorySupplierRef | null;
  policyMargin: number;
}

export interface ClassifyInventoryContext {
  policy: PolicyDraft;
  suppliers: SupplierQuoteRow[];
  now?: Date;
}

const QUOTE_CLOCK_TOLERANCE_MS = 60_000;

function formatMargin(value: number): string {
  return `${value.toFixed(2)}%`;
}

function isViableSupplier(
  quote: SupplierQuoteRow,
  unit: InventoryRecord,
  route: RoutePolicy,
  staleMinutes: number,
  now: Date,
  remainingCapacity: number,
): boolean {
  if (!quote.active) return false;
  if (quote.gram !== unit.gram) return false;
  if (!quote.lockAvailable) return false;
  if (quote.quotePrice == null || !(quote.quotePrice > 0)) return false;
  if (quote.name.trim().toUpperCase() === "GMI") return false;

  const quoteTime = Date.parse(quote.quoteTime);
  const validUntil = Date.parse(quote.validUntil);
  if (!Number.isFinite(quoteTime) || !Number.isFinite(validUntil)) return false;
  if (validUntil <= now.getTime()) return false;
  if (quoteTime > now.getTime() + QUOTE_CLOCK_TOLERANCE_MS) return false;

  const ageMs = now.getTime() - quoteTime;
  if (ageMs > staleMinutes * 60_000) return false;

  if (quote.capacity < unit.gram) return false;
  if (quote.leadTime > route.maxLeadHours) return false;

  const sellingPrice = unit.sellingPrice;
  if (sellingPrice == null || !(sellingPrice > 0)) return false;

  const routedMargin =
    ((sellingPrice - quote.quotePrice) / sellingPrice) * 100;
  if (routedMargin < route.minimumMargin) return false;

  if (route.capacityRequired && remainingCapacity < unit.gram) return false;

  return true;
}

function findBestViableSupplier(
  unit: InventoryRecord,
  suppliers: SupplierQuoteRow[],
  route: RoutePolicy,
  staleMinutes: number,
  now: Date,
  consumedByQuoteId: Map<string, number>,
): SupplierQuoteRow | null {
  const sellingPrice = unit.sellingPrice;
  if (sellingPrice == null) return null;

  let best: SupplierQuoteRow | null = null;

  for (const quote of suppliers) {
    if (quote.quotePrice == null) continue;
    const consumed = consumedByQuoteId.get(quote.quoteId) ?? 0;
    const remaining = quote.capacity - consumed;
    if (
      !isViableSupplier(quote, unit, route, staleMinutes, now, remaining)
    ) {
      continue;
    }
    if (
      best == null ||
      (quote.quotePrice != null &&
        best.quotePrice != null &&
        quote.quotePrice < best.quotePrice)
    ) {
      best = quote;
    }
  }

  return best;
}

export function classifyUnit(
  unit: InventoryRecord,
  margin: MarginPolicy,
  route: RoutePolicy,
  suppliers: SupplierQuoteRow[],
  staleMinutes: number,
  now: Date,
  consumedByQuoteId: Map<string, number>,
): UnitDecision | null {
  if (!unit.valid || !unit.ready) return null;
  if (unit.sellingPrice == null || unit.directMargin == null) return null;

  const policyMargin = margin.minimumMargin[unit.channel]?.[unit.gram];
  if (policyMargin == null || !Number.isFinite(policyMargin)) return null;

  const apiMargin = unit.directMargin;

  if (apiMargin >= policyMargin) {
    return {
      decision: "SELL READY",
      recommendedAction: "SELL READY",
      reason: `Margin ${formatMargin(apiMargin)} meets policy ${formatMargin(policyMargin)}.`,
      supplier: null,
      policyMargin,
    };
  }

  const quote = findBestViableSupplier(
    unit,
    suppliers,
    route,
    staleMinutes,
    now,
    consumedByQuoteId,
  );

  if (quote && quote.quotePrice != null) {
    const consumed = consumedByQuoteId.get(quote.quoteId) ?? 0;
    consumedByQuoteId.set(quote.quoteId, consumed + unit.gram);

    return {
      decision: "ROUTE ELIGIBLE",
      recommendedAction: "WATCH",
      reason: `Margin ${formatMargin(apiMargin)} below policy ${formatMargin(policyMargin)}; replacement via ${quote.name}.`,
      supplier: { name: quote.name, quotePrice: quote.quotePrice },
      policyMargin,
    };
  }

  return {
    decision: "HOLD",
    recommendedAction: "WAIT",
    reason: `Margin ${formatMargin(apiMargin)} below policy ${formatMargin(policyMargin)}; no viable replacement.`,
    supplier: null,
    policyMargin,
  };
}

export function classifyInventory(
  records: InventoryRecord[],
  context: ClassifyInventoryContext,
): InventoryRecord[] {
  const now = context.now ?? new Date();
  const consumedByQuoteId = new Map<string, number>();
  const { margin, route, system } = context.policy;

  return records.map((unit) => {
    const result = classifyUnit(
      unit,
      margin,
      route,
      context.suppliers,
      system.staleMinutes,
      now,
      consumedByQuoteId,
    );

    if (!result) {
      return {
        ...unit,
        decision: null,
        recommendedAction: null,
        reason: null,
        supplier: null,
        policyMargin: unit.valid
          ? margin.minimumMargin[unit.channel]?.[unit.gram] ?? null
          : null,
      };
    }

    return {
      ...unit,
      decision: result.decision,
      recommendedAction: result.recommendedAction,
      reason: result.reason,
      supplier: result.supplier,
      policyMargin: result.policyMargin,
    };
  });
}
