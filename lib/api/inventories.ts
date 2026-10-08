import type { InventoryRecord, InventorySummary } from "@/domain/inventory";
import type { Channel, Gram } from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import { apiGet } from "@/lib/api/http";

/** Live backend shape — `GET /inventories`. */
export interface InventoryRowDto {
  stockId: number | string;
  serial: string;
  grammage: number;
  channel: string;
  production: number | string | null;
  stockKeeper: string;
  unitCost: number | null;
  sellingPrice: number | null;
  directGp: number | null;
  marginPercentage: number | null;
}

function isGram(value: number): value is Gram {
  return (GRAMS as readonly number[]).includes(value);
}

function isChannel(value: string): value is Channel {
  return value === "B2C" || value === "B2B";
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function mapInventoryRow(dto: InventoryRowDto): InventoryRecord {
  const channel: Channel = isChannel(dto.channel) ? dto.channel : "B2C";
  const channelOk = isChannel(dto.channel);
  const gramOk = isGram(dto.grammage);
  const unitCost = isPositiveNumber(dto.unitCost) ? dto.unitCost : 0;
  const serial = typeof dto.serial === "string" ? dto.serial.trim() : "";
  const stockId = String(dto.stockId ?? "").trim();

  const valid =
    channelOk &&
    gramOk &&
    serial.length > 0 &&
    stockId.length > 0 &&
    unitCost > 0;

  const sellingPrice =
    typeof dto.sellingPrice === "number" && Number.isFinite(dto.sellingPrice)
      ? dto.sellingPrice
      : null;

  const directGp =
    typeof dto.directGp === "number" && Number.isFinite(dto.directGp)
      ? dto.directGp
      : null;

  const directMargin =
    typeof dto.marginPercentage === "number" &&
    Number.isFinite(dto.marginPercentage)
      ? dto.marginPercentage
      : null;

  const production =
    dto.production == null || dto.production === ""
      ? ""
      : String(dto.production);

  const grossProfit =
    sellingPrice != null && unitCost > 0
      ? sellingPrice - unitCost
      : directGp;

  return {
    stockId,
    serial,
    gram: dto.grammage as Gram,
    channel,
    availabilityStatus: valid ? "READY" : "INVALID",
    reserved: false,
    unitCost,
    purchasePrice: unitCost,
    sellingPrice,
    directGp: valid ? (directGp ?? grossProfit) : null,
    directMargin: valid ? directMargin : null,
    decision: null,
    recommendedAction: null,
    production,
    stockKeeper: dto.stockKeeper ?? "",
    marketAtPurchase: null,
    marketAtSale: null,
    profit: {
      prognosa: null,
      investment: null,
      arbitrage: null,
      total: valid && grossProfit != null ? grossProfit : null,
    },
    reason: null,
    supplier: null,
    policyMargin: null,
    valid,
    ready: valid,
  };
}

export function summarizeInventory(
  records: InventoryRecord[],
): InventorySummary {
  const ready = records.filter((row) => row.ready && row.valid);
  const invalid = records.filter((row) => !row.valid);
  const unpriced = ready.filter((row) => row.sellingPrice == null);

  return {
    readyGrams: ready.reduce((sum, row) => sum + row.gram, 0),
    readyPcs: ready.length,
    invalidPcs: invalid.length,
    unpricedPcs: unpriced.length,
  };
}

export async function fetchInventories(): Promise<InventoryRecord[]> {
  const rows = await apiGet<InventoryRowDto[]>("/inventories");
  return rows.map(mapInventoryRow);
}

export function findInventoryRecord(
  records: InventoryRecord[] | undefined,
  stockId: string,
): InventoryRecord | undefined {
  return records?.find((row) => row.stockId === stockId);
}
