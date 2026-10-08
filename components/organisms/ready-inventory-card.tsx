"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { AnimatedValue } from "@/components/molecules/animated-value";
import { Card } from "@/components/molecules/card";
import { DeltaBubble } from "@/components/molecules/delta-bubble";
import { ProfitColumn } from "@/components/molecules/profit-column";
import { SplitLegend } from "@/components/molecules/split-legend";
import { InventorySplitBar } from "@/components/organisms/inventory-split-bar";
import type { HomeIntelligence } from "@/domain/intelligence";
import type { Segment } from "@/domain/primitives";
import { formatNumber } from "@/lib/format/money";
import { toneForDelta } from "@/lib/motion/delta-sentiment";
import { useBubblePresence } from "@/lib/motion/use-bubble-presence";

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
  const t = useTranslations("home.ready");
  const tProfit = useTranslations("home.profit");
  const tCommon = useTranslations("common");
  const channel =
    segment === "all" ? t("channelAll") : segment.toUpperCase();
  const [gramsDelta, setGramsDelta] = useState(0);
  const onGramsDelta = useCallback((delta: number) => {
    setGramsDelta(delta);
  }, []);
  const gramsTone = toneForDelta(gramsDelta, "good-up");
  const gramsActive = gramsDelta !== 0 && gramsTone !== "neutral";
  const gramsBubble = useBubblePresence(
    gramsActive,
    gramsActive
      ? `${gramsDelta > 0 ? "+" : ""}${formatNumber(Math.round(gramsDelta))}g`
      : "",
    gramsActive ? gramsTone : "neutral",
  );

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
      aria-label={t("ariaEvidence")}
      onClick={onOpenEvidence}
      onKeyDown={onKeyDown}
      className="grid cursor-pointer grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)] gap-0 overflow-hidden p-0 py-0 [--card-spacing:0px] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-route-f max-[1000px]:grid-cols-1 max-[700px]:rounded-2xl"
    >
      <div className="flex min-w-0 flex-col gap-4.5 px-7 py-6 max-[1000px]:p-5.5 max-[700px]:p-4.5 min-[2560px]:px-8.5 min-[2560px]:py-7.5">
        <div className="text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
          {t("title", { channel })}
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <strong className="mono text-[3.75rem] leading-none font-medium tracking-[-0.03em] max-[700px]:text-[2.85rem] max-[480px]:text-[2.45rem]">
            <AnimatedValue
              value={data.isComplete ? data.grams : null}
              sentiment="good-up"
              format={(value) => formatNumber(Math.round(value))}
              emptyLabel={tCommon("emDash")}
              showBubble={false}
              onDeltaChange={onGramsDelta}
            />
          </strong>
          <span className="relative inline-flex items-baseline gap-1 text-[1.125rem] text-muted-text">
            {gramsBubble ? (
              <DeltaBubble
                label={gramsBubble.label}
                tone={gramsBubble.tone}
                placement="above"
                exiting={gramsBubble.exiting}
              />
            ) : null}
            <span>{tCommon("gram")}</span>
            <span aria-hidden="true">·</span>
            {data.isComplete ? (
              <AnimatedValue
                value={data.pcs}
                sentiment="good-up"
                format={(value) => formatNumber(Math.round(value))}
                emptyLabel={tCommon("emDash")}
                showBubble={false}
              />
            ) : (
              tCommon("emDash")
            )}
            <span>pcs</span>
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
                  label: t("legendSell"),
                  percentage: data.split.sell,
                },
                {
                  key: "route",
                  label: t("legendRoute"),
                  percentage: data.split.route,
                },
                {
                  key: "hold",
                  label: t("legendHold"),
                  percentage: data.split.hold,
                },
              ]}
            />
          ) : (
            <p className="mt-2.5 text-base text-muted-text">
              {t("unavailable")}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 border-l border-line px-7 py-6 max-[1000px]:border-t max-[1000px]:border-l-0 max-[1000px]:grid-cols-2 max-[1000px]:p-5.5 max-[700px]:grid-cols-1 max-[700px]:p-4.5 min-[2560px]:px-8.5 min-[2560px]:py-7.5">
        <ProfitColumn
          label={tProfit("prognosa")}
          value={data.isComplete ? data.profit.prognosa : null}
          note={tProfit("prognosaNote")}
        />
        <ProfitColumn
          label={tProfit("investment")}
          value={data.isComplete ? data.profit.investment : null}
          note={tProfit("investmentNote")}
        />
        <ProfitColumn
          label={tProfit("arbitrage")}
          value={data.isComplete ? data.profit.arbitrage : null}
          note={tProfit("arbitrageNote")}
        />
        <ProfitColumn
          label={tProfit("gross")}
          value={data.isComplete ? data.profit.total : null}
          note={tProfit("grossNote")}
        />
      </div>
    </Card>
  );
}
