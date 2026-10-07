"use client";

import { useTranslations } from "next-intl";
import { TONE_FILL_CLASS } from "@/domain/intelligence";
import type { DecisionBucket } from "@/domain/primitives";

export interface InventorySplitBarProps {
  sell: number;
  route: number;
  hold: number;
}

const SEGMENTS: DecisionBucket[] = ["sell", "route", "hold"];

export function InventorySplitBar({ sell, route, hold }: InventorySplitBarProps) {
  const t = useTranslations("home.ready");
  const widths: Record<DecisionBucket, number> = { sell, route, hold };

  return (
    <div
      className="flex h-4 gap-0.75 overflow-hidden rounded-sm bg-track"
      aria-label={t("splitAria")}
    >
      {SEGMENTS.map((key) => (
        <span
          key={key}
          className={TONE_FILL_CLASS[key]}
          style={{ width: `${Math.max(widths[key], 0)}%` }}
        />
      ))}
    </div>
  );
}
