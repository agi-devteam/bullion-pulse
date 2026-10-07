"use client";

import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Status } from "@/components/atoms/status";
import { DenominationBarChart } from "@/components/organisms/denomination-bar-chart";
import type { BucketData, SupplierSplit } from "@/domain/intelligence";
import type { DecisionBucket } from "@/domain/primitives";
import { compactRupiah, formatNumber } from "@/lib/format/money";
import { cn } from "@/lib/utils";

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
  const gramasiCount = data.denominations.filter((row) => row.grams > 0).length;

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
            {isComplete
              ? compactRupiah(data.profit.prognosa)
              : tCommon("emDash")}
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
      <h2 className="mt-1.5 text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] font-bold tracking-tighter text-ink max-[700px]:text-[3.3rem] max-[480px]:text-[2.9rem]">
        {bucket.toUpperCase()}
      </h2>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <div className="inline-flex shrink-0 items-baseline gap-1.5">
          <strong className="mono text-[2.25rem] font-normal tracking-[-0.02em] max-[480px]:text-[1.9rem]">
            {isComplete ? formatNumber(data.grams) : tCommon("emDash")}
          </strong>
          <span className="text-base text-muted-text">
            {tCommon("gram")}
            {bucket !== "route"
              ? ` ${tCommon("gramasiCount", { count: gramasiCount })}`
              : ""}
          </span>
        </div>
        {bucket === "route" && supplierSplit.length > 0 ? (
          <div
            className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 text-[min(0.9375rem,20px)] leading-[1.4] text-muted-text"
            role="list"
            aria-label={t("supplierAria")}
          >
            {supplierSplit.map((supplier) => (
              <span
                key={supplier.name}
                className="flex items-baseline gap-1.75"
                role="listitem"
              >
                <b className="font-semibold text-route-t">{supplier.name}</b>
                <span className="mono shrink-0 text-ink">
                  {formatNumber(supplier.grams)}g
                </span>
              </span>
            ))}
          </div>
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
