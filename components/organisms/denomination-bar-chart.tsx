"use client";

import { useTranslations } from "next-intl";
import { TONE_FILL_CLASS } from "@/domain/intelligence";
import type { DecisionBucket } from "@/domain/primitives";
import { formatNumber } from "@/lib/format/money";

export interface DenominationBarChartProps {
  rows: { gram: number; value: number }[];
  tone: DecisionBucket;
}

export function DenominationBarChart({ rows, tone }: DenominationBarChartProps) {
  const t = useTranslations("home.decision");
  const tCommon = useTranslations("common");
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="mt-3 flex flex-col border-t border-line pt-4">
      <div className="mb-1.5 text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
        {t("chartTitle")}
      </div>
      {rows.map((row) => (
        <div
          key={row.gram}
          className="grid min-h-6.5 grid-cols-[44px_minmax(0,1fr)_68px] items-center gap-3 text-base"
        >
          <span className="mono text-left text-[0.9375rem] text-muted-text">
            {row.gram}g
          </span>
          <span className="h-2 overflow-hidden rounded bg-track">
            <span
              className={`block h-full rounded ${TONE_FILL_CLASS[tone]}`}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </span>
          <span className="mono text-right">
            {row.value ? formatNumber(row.value) : tCommon("emDash")}
          </span>
        </div>
      ))}
    </div>
  );
}
