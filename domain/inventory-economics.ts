import type { InventoryRecord } from "@/domain/inventory";
import type { Gram } from "@/domain/primitives";

export type AntamSellByGram = Partial<Record<Gram | number, number>>;

export function unitGrossProfit(unit: InventoryRecord): number | null {
  if (
    unit.sellingPrice != null &&
    Number.isFinite(unit.sellingPrice) &&
    unit.unitCost > 0
  ) {
    return unit.sellingPrice - unit.unitCost;
  }
  if (unit.directGp != null && Number.isFinite(unit.directGp)) {
    return unit.directGp;
  }
  return null;
}

export function enrichInventoryEconomics(
  records: InventoryRecord[],
  antamSellByGram: AntamSellByGram,
): InventoryRecord[] {
  return records.map((unit) => {
    const antam = antamSellByGram[unit.gram];
    const marketAtSale =
      typeof antam === "number" && Number.isFinite(antam) && antam > 0
        ? antam
        : null;

    const arbitrage =
      unit.sellingPrice != null && marketAtSale != null
        ? unit.sellingPrice - marketAtSale
        : null;

    const total = unit.valid ? unitGrossProfit(unit) : null;

    return {
      ...unit,
      marketAtSale,
      profit: {
        ...unit.profit,
        arbitrage,
        total,
      },
    };
  });
}
