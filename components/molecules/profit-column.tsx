import { compactRupiah } from "@/lib/format/money";
import { cn } from "@/lib/utils";

export interface ProfitColumnProps {
  label: string;
  value: number | null;
  note: string;
  variant?: "arbitrage";
}

export function ProfitColumn({
  label,
  value,
  note,
  variant,
}: ProfitColumnProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-[18px] px-5",
        "first:pl-0 last:pr-0 [&+&]:border-l [&+&]:border-line",
      )}
    >
      <div className="text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
        {label}
      </div>
      <div
        className={cn(
          "mono flex items-baseline whitespace-nowrap text-[2.25rem] font-normal leading-none",
          "before:invisible before:w-0 before:shrink-0 before:font-mono before:text-[3.75rem] before:leading-none before:content-['\\a0']",
          variant === "arbitrage" && "text-muted-text",
        )}
      >
        {compactRupiah(value)}
      </div>
      <div className="mt-auto text-[0.9375rem] text-muted-text">{note}</div>
    </div>
  );
}
