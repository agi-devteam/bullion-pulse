import type {
  ActionAlert,
  ActionAlertSupplier,
  ActionSeverity,
} from "@/domain/actions";
import type { InventoryRecord } from "@/domain/inventory";
import type { PriorityAction } from "@/domain/intelligence";
import type { Channel, Gram } from "@/domain/primitives";
import type { SupplierQuoteRow } from "@/domain/suppliers";

export interface BuildActionAlertsInput {
  inventory: InventoryRecord[];
  suppliers?: SupplierQuoteRow[];
  now?: Date;
}

interface AlertGroup {
  channel: Channel;
  gram: Gram;
  units: InventoryRecord[];
}

function average(
  values: Array<number | null | undefined>,
): number | null {
  const present = values.filter(
    (value): value is number => value != null && Number.isFinite(value),
  );
  if (present.length === 0) return null;
  return (
    present.reduce((sum, value) => sum + value, 0) / present.length
  );
}

function replacementMarginFor(
  unit: InventoryRecord,
): number | null {
  if (
    unit.sellingPrice == null ||
    !(unit.sellingPrice > 0) ||
    unit.supplier == null
  ) {
    return null;
  }
  return (
    ((unit.sellingPrice - unit.supplier.quotePrice) / unit.sellingPrice) *
    100
  );
}

function pickDominantSupplierName(units: InventoryRecord[]): string | null {
  const byName = new Map<string, number>();
  for (const unit of units) {
    if (!unit.supplier) continue;
    byName.set(
      unit.supplier.name,
      (byName.get(unit.supplier.name) ?? 0) + unit.gram,
    );
  }
  let best: string | null = null;
  let bestGrams = -1;
  for (const [name, grams] of byName) {
    if (grams > bestGrams) {
      best = name;
      bestGrams = grams;
    }
  }
  return best;
}

function resolveSupplier(
  units: InventoryRecord[],
  suppliers: SupplierQuoteRow[],
): ActionAlertSupplier | null {
  const name = pickDominantSupplierName(units);
  if (!name) return null;

  const sample = units.find((unit) => unit.supplier?.name === name);
  const quotePrice = sample?.supplier?.quotePrice;
  if (quotePrice == null) return null;

  const gram = sample?.gram;
  const quote =
    gram != null
      ? suppliers.find(
          (row) =>
            row.name === name &&
            row.gram === gram &&
            row.quotePrice != null,
        )
      : undefined;

  return {
    name,
    quotePrice,
    capacity: quote?.capacity ?? 0,
    leadTime: quote?.leadTime ?? 0,
  };
}

function severityFor(existingMargin: number | null): ActionSeverity {
  if (existingMargin != null && existingMargin < 0) return "risk";
  return "attention";
}

function groupWatchUnits(inventory: InventoryRecord[]): AlertGroup[] {
  const groups = new Map<string, AlertGroup>();

  for (const unit of inventory) {
    if (unit.decision !== "ROUTE ELIGIBLE") continue;
    if (unit.recommendedAction !== "WATCH") continue;
    if (!unit.valid || !unit.ready) continue;

    const key = `${unit.channel}:${unit.gram}`;
    const existing = groups.get(key);
    if (existing) {
      existing.units.push(unit);
      continue;
    }
    groups.set(key, {
      channel: unit.channel,
      gram: unit.gram,
      units: [unit],
    });
  }

  return [...groups.values()];
}

export function buildActionAlerts(
  input: BuildActionAlertsInput,
): ActionAlert[] {
  const now = input.now ?? new Date();
  const suppliers = input.suppliers ?? [];
  const createdAt = now.toISOString();

  return groupWatchUnits(input.inventory)
    .map((group) => {
      const existingMargin = average(
        group.units.map((unit) => unit.directMargin),
      );
      const replacementMargin = average(
        group.units.map(replacementMarginFor),
      );
      const quantity = group.units.length;
      const grams = quantity * group.gram;

      return {
        id: `WATCH-${group.channel}-${group.gram}`,
        severity: severityFor(existingMargin),
        action: "WATCH" as const,
        channel: group.channel,
        gram: group.gram,
        quantity,
        grams,
        existingMargin:
          existingMargin == null
            ? null
            : Number(existingMargin.toFixed(2)),
        replacementMargin:
          replacementMargin == null
            ? null
            : Number(replacementMargin.toFixed(2)),
        status: "OPEN" as const,
        createdAt,
        supplier: resolveSupplier(group.units, suppliers),
      };
    })
    .sort((a, b) => b.grams - a.grams || a.gram - b.gram);
}

export function toPriorityActions(
  alerts: ActionAlert[],
  limit = 3,
): PriorityAction[] {
  return alerts.slice(0, limit).map((alert) => ({
    id: alert.id,
    action: alert.action,
    channel: alert.channel,
    gram: alert.gram,
    grams: alert.grams,
    replacementMargin: alert.replacementMargin,
    href: "/actions",
  }));
}
