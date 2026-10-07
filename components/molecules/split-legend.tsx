import { TONE_DOT_CLASS } from "@/domain/intelligence";
import type { DecisionBucket } from "@/domain/primitives";
import { formatPercent } from "@/lib/format/money";

export interface SplitLegendProps {
  items: {
    key: DecisionBucket;
    label: string;
    percentage: number;
  }[];
}

export function SplitLegend({ items }: SplitLegendProps) {
  return (
    <div className="mt-2.5 flex flex-wrap justify-between gap-2 text-base">
      {items.map((item) => (
        <span key={item.key} className="flex items-center gap-0.75">
          <i
            aria-hidden="true"
            className={`size-2.75 flex-none rounded-full ${TONE_DOT_CLASS[item.key]}`}
          />
          {item.label}{" "}
          <b className="mono font-bold">{formatPercent(item.percentage, 1)}</b>
        </span>
      ))}
    </div>
  );
}
