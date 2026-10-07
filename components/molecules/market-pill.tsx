import { formatPercent } from "@/lib/format/money";

export interface MarketPillProps {
  label: string;
  value: string;
  change?: number;
  title?: string;
}

export function MarketPill({ label, value, change, title }: MarketPillProps) {
  return (
    <span
      className="inline-flex items-center gap-[1ch] rounded-[999px] border border-line bg-surface px-3.5 py-2 text-[0.9375rem] whitespace-nowrap"
      title={title}
    >
      {label} <b className="font-bold">{value}</b>
      {change != null ? (
        <span
          className={
            change > 0 ? "text-sell-t" : change < 0 ? "text-hold-t" : undefined
          }
        >
          {change > 0 ? "+" : ""}
          {formatPercent(change)}
        </span>
      ) : null}
    </span>
  );
}
