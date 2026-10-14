import type { Channel, Gram } from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import { apiGet } from "@/lib/api/http";

export type PricelistSnapshotType = "CURRENT" | "PREVIOUS";

export interface GmiClubPricelistRowDto {
  channel: string;
  grammage: number;
  price: number;
  updatedAt?: number;
}

export interface AntamPriceRowDto {
  grammage: number;
  sellPrice: number;
  buybackPrice?: number;
}

export interface AntamPricelistSnapshotDto {
  type: string;
  updatedAt?: number;
  prices: AntamPriceRowDto[];
}

export interface AntamPricelistRowDto {
  grammage: number;
  sellPrice: number;
  buybackPrice?: number;
  updatedAt?: number;
}

export interface PricelistEntry {
  channel: Channel;
  gram: Gram;
  price: number;
  updatedAt?: number;
}

export interface AntamPricelistEntry {
  gram: Gram;
  sellPrice: number;
  buybackPrice: number | null;
  updatedAt?: number;
}

export interface AntamPricelistSnapshot {
  type: PricelistSnapshotType;
  updatedAt?: number;
  prices: AntamPricelistEntry[];
}

export interface XauPricelistRowDto {
  type?: string;
  price: number;
  updatedAt?: number;
}

export interface XauPricelistEntry {
  type?: PricelistSnapshotType;
  price: number;
  updatedAt?: number;
}

function isGram(value: number): value is Gram {
  return (GRAMS as readonly number[]).includes(value);
}

function isChannel(value: string): value is Channel {
  return value === "B2C" || value === "B2B";
}

function isSnapshotType(value: string): value is PricelistSnapshotType {
  return value === "CURRENT" || value === "PREVIOUS";
}

function percentChange(current: number, previous: number): number | null {
  if (!(previous > 0)) return null;
  return ((current - previous) / previous) * 100;
}

export function mapGmiClubPricelistRow(
  dto: GmiClubPricelistRowDto,
): PricelistEntry | null {
  if (!isChannel(dto.channel) || !isGram(dto.grammage)) return null;
  if (typeof dto.price !== "number" || !Number.isFinite(dto.price)) return null;

  return {
    channel: dto.channel,
    gram: dto.grammage,
    price: dto.price,
    updatedAt: dto.updatedAt,
  };
}

export function mapAntamPricelistRow(
  dto: AntamPricelistRowDto,
): AntamPricelistEntry | null {
  if (!isGram(dto.grammage)) return null;
  if (typeof dto.sellPrice !== "number" || !Number.isFinite(dto.sellPrice)) {
    return null;
  }

  const buybackPrice =
    typeof dto.buybackPrice === "number" && Number.isFinite(dto.buybackPrice)
      ? dto.buybackPrice
      : null;

  return {
    gram: dto.grammage,
    sellPrice: dto.sellPrice,
    buybackPrice,
    updatedAt: dto.updatedAt,
  };
}

export function mapAntamPricelistSnapshot(
  dto: AntamPricelistSnapshotDto,
): AntamPricelistSnapshot | null {
  if (!isSnapshotType(dto.type)) return null;
  if (!Array.isArray(dto.prices)) return null;

  const prices = dto.prices
    .map((row) =>
      mapAntamPricelistRow({
        ...row,
        updatedAt: dto.updatedAt,
      }),
    )
    .filter((row): row is AntamPricelistEntry => row != null);

  return {
    type: dto.type,
    updatedAt: dto.updatedAt,
    prices,
  };
}

export function pickAntamSnapshot(
  snapshots: AntamPricelistSnapshot[],
  type: PricelistSnapshotType,
): AntamPricelistSnapshot | undefined {
  return snapshots.find((snapshot) => snapshot.type === type);
}

export function antamBuybackPerGram(
  rows: AntamPricelistEntry[],
): number | null {
  let buyback: number | null = null;

  for (const row of rows) {
    if (row.buybackPrice != null && row.gram > 0) {
      const perGram = row.buybackPrice / row.gram;
      buyback = buyback == null ? perGram : Math.max(buyback, perGram);
    }
  }

  return buyback;
}

export function antamSellChangePercent(
  current: AntamPricelistEntry[],
  previous: AntamPricelistEntry[],
  gram: Gram = 1,
): number | null {
  const currentSell = current.find((row) => row.gram === gram)?.sellPrice;
  const previousSell = previous.find((row) => row.gram === gram)?.sellPrice;
  if (currentSell == null || previousSell == null) return null;
  return percentChange(currentSell, previousSell);
}

export function antamBuybackChangePercent(
  current: AntamPricelistEntry[],
  previous: AntamPricelistEntry[],
): number | null {
  const currentBuyback = antamBuybackPerGram(current);
  const previousBuyback = antamBuybackPerGram(previous);
  if (currentBuyback == null || previousBuyback == null) return null;
  return percentChange(currentBuyback, previousBuyback);
}

export async function fetchGmiClubPricelists(): Promise<PricelistEntry[]> {
  const rows = await apiGet<GmiClubPricelistRowDto[]>("/pricelists/gmiclub");
  return rows
    .map(mapGmiClubPricelistRow)
    .filter((row): row is PricelistEntry => row != null);
}

export async function fetchAntamPricelistSnapshots(): Promise<
  AntamPricelistSnapshot[]
> {
  const rows = await apiGet<AntamPricelistSnapshotDto[]>("/pricelists/antam");
  return rows
    .map(mapAntamPricelistSnapshot)
    .filter((row): row is AntamPricelistSnapshot => row != null);
}

export async function fetchAntamPricelists(): Promise<AntamPricelistEntry[]> {
  const snapshots = await fetchAntamPricelistSnapshots();
  return pickAntamSnapshot(snapshots, "CURRENT")?.prices ?? [];
}

export function mapXauPricelistRow(
  dto: XauPricelistRowDto,
): XauPricelistEntry | null {
  if (typeof dto.price !== "number" || !Number.isFinite(dto.price)) {
    return null;
  }

  return {
    type: dto.type != null && isSnapshotType(dto.type) ? dto.type : undefined,
    price: dto.price,
    updatedAt: dto.updatedAt,
  };
}

export async function fetchXauPricelists(): Promise<XauPricelistEntry[]> {
  const rows = await apiGet<XauPricelistRowDto[]>("/pricelists/xau");
  return rows
    .map(mapXauPricelistRow)
    .filter((row): row is XauPricelistEntry => row != null);
}

export { percentChange };
