import type { InventoryRecord } from "@/domain/inventory";
import type { Gram } from "@/domain/primitives";

export type AntamSellByGram = Partial<Record<Gram | number, number>>;

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

    return {
      ...unit,
      marketAtSale,
      profit: {
        ...unit.profit,
        arbitrage,
      },
    };
  });
}
