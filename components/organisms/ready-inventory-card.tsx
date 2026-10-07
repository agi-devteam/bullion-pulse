"use client";

import type { KeyboardEvent } from "react";
import { Card } from "@/components/molecules/card";
import { ProfitColumn } from "@/components/molecules/profit-column";
import { SplitLegend } from "@/components/molecules/split-legend";
import { InventorySplitBar } from "@/components/organisms/inventory-split-bar";
import type { HomeIntelligence } from "@/domain/intelligence";
import type { Segment } from "@/domain/primitives";
import { formatNumber } from "@/lib/format/money";

export interface ReadyInventoryCardProps {
  data: HomeIntelligence;
  segment: Segment;
  onOpenEvidence: () => void;
}

export function ReadyInventoryCard({
  data,
  segment,
  onOpenEvidence,
}: ReadyInventoryCardProps) {
  const channel = segment === "all" ? "All" : segment.toUpperCase();

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenEvidence();
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label="Lihat Ready Inventory evidence"
      onClick={onOpenEvidence}
      onKeyDown={onKeyDown}
      className="grid cursor-pointer grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-0 overflow-hidden p-0 py-0 [--card-spacing:0px] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-route-f max-[1000px]:grid-cols-1"
    >
      <div className="flex min-w-0 flex-col gap-[18px] px-7 py-6">
        <div className="text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
          Ready Inventory · {channel}
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <strong className="mono text-[3.75rem] leading-none font-medium tracking-[-0.03em]">
            {data.isComplete ? formatNumber(data.grams) : "—"}
          </strong>
          <span className="text-[1.125rem] text-muted-text">
            gram · {data.isComplete ? formatNumber(data.pcs) : "—"} pcs
          </span>
        </div>
        <div className="mt-auto">
          <InventorySplitBar
            sell={data.split.sell}
            route={data.split.route}
            hold={data.split.hold}
          />
          {data.isComplete ? (
            <SplitLegend
              items={[
                {
                  key: "sell",
                  label: "Sell-ready",
                  percentage: data.split.sell,
                },
                {
                  key: "route",
                  label: "Route eligible",
                  percentage: data.split.route,
                },
                { key: "hold", label: "Hold", percentage: data.split.hold },
              ]}
            />
          ) : (
            <p className="mt-2.5 text-base text-muted-text">
              Intelligence unavailable · inventory / pricelist belum valid.
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 border-l border-line px-7 py-6 max-[1000px]:border-t max-[1000px]:border-l-0 max-[700px]:grid-cols-1">
        <ProfitColumn
          label="Laba Prognosa"
          value={data.isComplete ? data.profit.prognosa : null}
          note="Estimasi READY · pasar saat beli − harga beli"
        />
        <ProfitColumn
          label="Laba Investment"
          value={data.isComplete ? data.profit.investment : null}
          note="Estimasi READY · pasar saat jual − pasar saat beli"
        />
        <ProfitColumn
          label="Laba Arbitrage"
          value={data.isComplete ? data.profit.arbitrage : null}
          note="Estimasi READY · harga jual − pasar saat jual"
          variant="arbitrage"
        />
      </div>
    </Card>
  );
}
