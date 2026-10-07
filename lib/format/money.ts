export function compactRupiah(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }

  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `Rp${(value / 1_000_000_000).toFixed(2)}M`;
  }

  if (absolute >= 1_000_000) {
    return `Rp${(value / 1_000_000).toFixed(1)}Jt`;
  }

  return `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
}

export function formatIdr(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—";
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
