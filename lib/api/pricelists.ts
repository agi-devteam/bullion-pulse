import type { Channel, Gram } from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import { apiGet } from "@/lib/api/http";

export interface GmiClubPricelistRowDto {
  channel: string;
  grammage: number;
  price: number;
  updatedAt?: number;
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

export interface PricingPricelistSources {
  gmiclub: PricelistEntry[];
  antam: AntamPricelistEntry[];
}

function isGram(value: number): value is Gram {
  return (GRAMS as readonly number[]).includes(value);
}

function isChannel(value: string): value is Channel {
  return value === "B2C" || value === "B2B";
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

export async function fetchGmiClubPricelists(): Promise<PricelistEntry[]> {
  const rows = await apiGet<GmiClubPricelistRowDto[]>("/pricelists/gmiclub");
  return rows
    .map(mapGmiClubPricelistRow)
    .filter((row): row is PricelistEntry => row != null);
}

export async function fetchAntamPricelists(): Promise<AntamPricelistEntry[]> {
  const rows = await apiGet<AntamPricelistRowDto[]>("/pricelists/antam");
  return rows
    .map(mapAntamPricelistRow)
    .filter((row): row is AntamPricelistEntry => row != null);
}

export async function fetchPricingPricelistSources(): Promise<PricingPricelistSources> {
  const [gmiclub, antam] = await Promise.all([
    fetchGmiClubPricelists(),
    fetchAntamPricelists().catch(() => [] as AntamPricelistEntry[]),
  ]);
  return { gmiclub, antam };
}
