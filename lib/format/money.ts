import type { Language } from "@/domain/primitives";

export function compactRupiah(
  value: number | null | undefined,
  language: Language = "id",
): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  const absolute = Math.abs(value);
  const numberLocale = language === "en" ? "en-US" : "id-ID";

  if (absolute >= 1_000_000_000) {
    const suffix = language === "en" ? "B" : "M";
    return `Rp${(value / 1_000_000_000).toFixed(2)}${suffix}`;
  }

  if (absolute >= 1_000_000) {
    const suffix = language === "en" ? "M" : "Jt";
    return `Rp${(value / 1_000_000).toFixed(1)}${suffix}`;
  }

  return `Rp${Math.round(value).toLocaleString(numberLocale)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
}

export function formatIdr(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

export function formatRupiah(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

export function formatUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
