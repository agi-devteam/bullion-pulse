export function formatStamp(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
}
