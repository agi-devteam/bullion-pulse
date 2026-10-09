"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Status } from "@/components/atoms/status";
import { AnimatedValue } from "@/components/molecules/animated-value";
import { DeltaBubble } from "@/components/molecules/delta-bubble";
import { OverflowChipList } from "@/components/molecules/overflow-chip-list";
import { DenominationBarChart } from "@/components/organisms/denomination-bar-chart";
import type { BucketData, SupplierSplit } from "@/domain/intelligence";
import type { DecisionBucket } from "@/domain/primitives";
import { compactRupiah, formatNumber } from "@/lib/format/money";
import {
  BUCKET_FLASH_CLASS,
  sentimentForBucket,
  toneForDelta,
} from "@/lib/motion/delta-sentiment";
import { useBubblePresence } from "@/lib/motion/use-bubble-presence";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings-store";

export interface DecisionPanelProps {
  bucket: DecisionBucket;
  data: BucketData;
  supplierSplit?: SupplierSplit[];
  policyFloor?: { b2c: number; b2b: number };
  isComplete: boolean;
  onClick: () => void;
}

export function DecisionPanel({
  bucket,
  data,
  supplierSplit = [],
  policyFloor,
  isComplete,
  onClick,
}: DecisionPanelProps) {
  const t = useTranslations("home.decision");
  const tCommon = useTranslations("common");
  const language = useSettingsStore((state) => state.language);
  const gramasiCount = data.denominations.filter((row) => row.grams > 0).length;
  const sentiment = sentimentForBucket(bucket);
  const gramsTarget = isComplete ? data.grams : null;
  const [flashingPanel, setFlashingPanel] = useState(false);
  const [gramsDelta, setGramsDelta] = useState(0);
  const flashTimer = useRef(0);
  const gramsTone = toneForDelta(gramsDelta, sentiment);
  const gramsActive = gramsDelta !== 0 && gramsTone !== "neutral";
  const gramsBubble = useBubblePresence(
    gramsActive,
    gramsActive
      ? `${gramsDelta > 0 ? "+" : ""}${formatNumber(Math.round(gramsDelta))}g`
      : "",
    gramsActive ? gramsTone : "neutral",
  );

  const onGramsDelta = useCallback((delta: number) => {
    setGramsDelta(delta);
    if (delta === 0) return;
    setFlashingPanel(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashingPanel(false), 1_200);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(flashTimer.current);
    },
    [],
  );

  function descriptionFor() {
    if (!isComplete) {
      return t("descIncomplete");
    }

    if (bucket === "sell") {
      return t("descSell");
    }

    if (bucket === "route") {
      return data.grams ? t("descRoute") : t("descRouteEmpty");
    }

    return t("descHold");
  }

  function footerFor() {
    if (bucket === "sell") {
      return (
        <span>
          {t("footerPrognosa")}{" "}
          <b className="mono font-bold">
            {isComplete ? (
              <AnimatedValue
                value={data.profit.prognosa}
                sentiment="good-up"
                format={(value) => compactRupiah(value, language)}
                emptyLabel={tCommon("emDash")}
                showBubble={false}
              />
            ) : (
              tCommon("emDash")
            )}
          </b>
        </span>
      );
    }

    if (bucket === "route") {
      return <span>{t("footerRoute")}</span>;
    }

    return (
      <span>
        {t("footerFloor", {
          b2c: policyFloor ? policyFloor.b2c.toFixed(2) : tCommon("emDash"),
          b2b: policyFloor ? policyFloor.b2b.toFixed(2) : tCommon("emDash"),
        })}
      </span>
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <section
      className={cn(
        "flex min-w-0 cursor-pointer flex-col gap-3 px-7 py-6 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-route-f",
        "[&+&]:border-l [&+&]:border-line max-[1000px]:p-5.5 max-[1000px]:[&+&]:border-t max-[1000px]:[&+&]:border-l-0",
        "max-[700px]:px-4.5 max-[700px]:py-5 min-[2560px]:px-8.5 min-[2560px]:py-7.5",
        flashingPanel ? BUCKET_FLASH_CLASS[bucket] : null,
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={t("ariaEvidence", { bucket: bucket.toUpperCase() })}
    >
      <div className="flex items-center justify-between">
        <Status
          tone={bucket}
          className="px-3.5 py-1.5 text-[0.9375rem] leading-normal"
        >
          {t(`captions.${bucket}`)}
        </Status>
        <ArrowUpRight size={20} aria-hidden="true" />
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-3 max-[480px]:gap-2.5">
        <h2 className="m-0 text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] font-bold tracking-tighter text-ink max-[700px]:text-[3.3rem] max-[480px]:text-[2.9rem]">
          {bucket.toUpperCase()}
        </h2>
        {gramsBubble ? (
          <DeltaBubble
            label={gramsBubble.label}
            tone={gramsBubble.tone}
            placement="inline"
            exiting={gramsBubble.exiting}
          />
        ) : null}
      </div>
      <div className="flex min-w-0 items-baseline gap-x-4">
        <div className="inline-flex shrink-0 items-baseline gap-1.5">
          <strong className="mono text-[2.25rem] font-normal tracking-[-0.02em] max-[480px]:text-[1.9rem]">
            <AnimatedValue
              value={gramsTarget}
              sentiment={sentiment}
              showBubble={false}
              format={(value) => formatNumber(Math.round(value))}
              emptyLabel={tCommon("emDash")}
              onDeltaChange={onGramsDelta}
            />
          </strong>
          <span className="text-base text-muted-text">
            {tCommon("gram")}
            {bucket !== "route"
              ? ` ${tCommon("gramasiCount", { count: gramasiCount })}`
              : ""}
          </span>
        </div>
        {bucket === "route" && supplierSplit.length > 0 ? (
          <OverflowChipList
            items={supplierSplit}
            getKey={(supplier) => supplier.name}
            aria-label={t("supplierAria")}
            listClassName="gap-x-3.5 text-[min(0.9375rem,20px)] leading-[1.4] text-muted-text"
            itemClassName="inline-flex items-baseline gap-1.75"
            moreClassName="text-[min(0.9375rem,20px)] leading-[1.4] text-muted-text"
            moreLabel={(count) => t("supplierMore", { count })}
            renderItem={(supplier) => (
              <>
                <b className="font-semibold text-route-t">{supplier.name}</b>
                <span className="mono shrink-0 text-ink">
                  <AnimatedValue
                    value={supplier.grams}
                    sentiment="bad-up"
                    format={(value) => `${formatNumber(Math.round(value))}g`}
                    showBubble={false}
                  />
                </span>
              </>
            )}
            renderMeasureItem={(supplier) => (
              <>
                <b className="font-semibold text-route-t">{supplier.name}</b>
                <span className="mono shrink-0 text-ink">
                  {formatNumber(Math.round(supplier.grams))}g
                </span>
              </>
            )}
            renderOverflow={(hidden) => (
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {hidden.map((supplier) => (
                  <li
                    key={supplier.name}
                    className="flex items-baseline gap-1.75"
                  >
                    <b className="font-semibold text-route-t">{supplier.name}</b>
                    <span className="mono shrink-0 text-ink">
                      {formatNumber(Math.round(supplier.grams))}g
                    </span>
                  </li>
                ))}
              </ul>
            )}
          />
        ) : null}
      </div>
      <p className="m-0 text-base leading-[1.45] text-muted-text">
        {descriptionFor()}
      </p>
      <DenominationBarChart
        tone={bucket}
        rows={data.denominations.map((row) => ({
          gram: row.gram,
          value: row.grams,
        }))}
      />
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 text-base">
        {footerFor()}
        <ChevronRight size={18} aria-hidden="true" />
      </div>
    </section>
  );
}
