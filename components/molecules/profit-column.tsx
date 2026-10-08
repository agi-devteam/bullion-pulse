"use client";

import { AnimatedValue } from "@/components/molecules/animated-value";
import { compactRupiah } from "@/lib/format/money";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings-store";

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
  const language = useSettingsStore((state) => state.language);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4.5 px-5",
        "first:pl-0 last:pr-0 [&+&]:border-l [&+&]:border-line",
        "max-[1000px]:nth-[2n+1]:border-l-0 max-[1000px]:nth-[n+3]:border-t max-[1000px]:nth-[n+3]:border-line",
        "max-[700px]:px-0 max-[700px]:py-3.5 max-[700px]:first:pt-0 max-[700px]:last:pb-0",
        "max-[700px]:[&+&]:border-t max-[700px]:[&+&]:border-l-0",
      )}
    >
      <div className="text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
        {label}
      </div>
      <div
        className={cn(
          "flex items-baseline whitespace-nowrap text-[2.25rem] font-normal leading-none",
          "before:invisible before:w-0 before:shrink-0 before:font-mono before:text-[3.75rem] before:leading-none before:content-['\\a0'] max-[700px]:before:hidden",
          variant === "arbitrage" ? "text-muted-text" : "mono",
        )}
      >
        <AnimatedValue
          value={value}
          sentiment="good-up"
          bubblePlacement="below"
          format={(next) => compactRupiah(next, language)}
          emptyLabel={compactRupiah(null, language)}
          formatDelta={(delta) => {
            const sign = delta > 0 ? "+" : "";
            return `${sign}${compactRupiah(delta, language)}`;
          }}
          className={variant === "arbitrage" ? "text-muted-text" : undefined}
        />
      </div>
      <div className="mt-auto text-[0.9375rem] text-muted-text">{note}</div>
    </div>
  );
}
