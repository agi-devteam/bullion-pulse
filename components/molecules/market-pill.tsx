import { formatPercent } from "@/lib/format/money";
import { cn } from "@/lib/utils";

export interface MarketPillProps {
  label?: string;
  value: string;
  change?: number;
  title?: string;
  muted?: boolean;
}

export function MarketPill({
  label,
  value,
  change,
  title,
  muted,
}: MarketPillProps) {
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-[1ch] rounded-[999px] border border-line bg-surface px-3.5 py-2 text-[0.9375rem] whitespace-nowrap",
        muted && "text-muted-text",
      )}
      title={title}
    >
      {label ? (
        <>
          {label} <b className="font-bold">{value}</b>
        </>
      ) : (
        value
      )}
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
