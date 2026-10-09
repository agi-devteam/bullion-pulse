import type { Gram } from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import type { SupplierQuoteRow } from "@/domain/suppliers";
import { apiGet } from "@/lib/api/http";

/** GET /suppliers item — live quote + lock fields. */
export interface SupplierQuoteDto {
  supplierId: string;
  quoteId: string;
  name: string;
  active: boolean;
  grammage: number;
  quotePrice: number | null;
  capacity: number;
  leadTime: number;
  quoteTime: number | string;
  validUntil: number | string;
  lockAvailable: boolean;
  lockStatus: string;
}

function isGram(value: number): value is Gram {
  return (GRAMS as readonly number[]).includes(value);
}

export function toIsoTimestamp(value: number | string | null | undefined): string {
  if (value == null || value === "") return "";

  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    return new Date(ms).toISOString();
  }

  const trimmed = String(value).trim();
  if (/^\d+$/.test(trimmed)) {
    const raw = Number(trimmed);
    if (Number.isFinite(raw)) {
      const ms = raw < 1e12 ? raw * 1000 : raw;
      return new Date(ms).toISOString();
    }
  }

  const parsed = new Date(trimmed);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : trimmed;
}

export function mapSupplierQuote(dto: SupplierQuoteDto): SupplierQuoteRow {
  const gram = isGram(dto.grammage) ? dto.grammage : (dto.grammage as Gram);
  const quotePrice =
    typeof dto.quotePrice === "number" && Number.isFinite(dto.quotePrice)
      ? dto.quotePrice
      : null;

  return {
    quoteId: String(dto.quoteId ?? ""),
    supplierId: String(dto.supplierId ?? ""),
    name: dto.name ?? "",
    active: Boolean(dto.active),
    gram,
    quotePrice,
    capacity: Number.isFinite(dto.capacity) ? dto.capacity : 0,
    leadTime: Number.isFinite(dto.leadTime) ? dto.leadTime : 0,
    quoteTime: toIsoTimestamp(dto.quoteTime),
    validUntil: toIsoTimestamp(dto.validUntil),
    lockAvailable: Boolean(dto.lockAvailable),
    lockStatus: dto.lockStatus ?? "",
  };
}

export async function fetchSupplierDtos(): Promise<SupplierQuoteDto[]> {
  return apiGet<SupplierQuoteDto[]>("/suppliers");
}

export async function fetchSuppliers(): Promise<SupplierQuoteRow[]> {
  const rows = await fetchSupplierDtos();
  return rows.map(mapSupplierQuote);
}
