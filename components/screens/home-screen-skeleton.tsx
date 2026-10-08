"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/atoms/skeleton";
import { Status } from "@/components/atoms/status";
import { Card } from "@/components/molecules/card";
import { GRAMS } from "@/domain/primitives";
import type { DecisionBucket } from "@/domain/primitives";
import { useSettingsStore } from "@/stores/use-settings-store";

const DECISION_BUCKETS: DecisionBucket[] = ["sell", "route", "hold"];

function ReadyInventoryCardSkeleton() {
  const t = useTranslations("home.ready");
  const tProfit = useTranslations("home.profit");
  const segment = useSettingsStore((state) => state.segment);
  const channel =
    segment === "all" ? t("channelAll") : segment.toUpperCase();

  return (
    <Card
      aria-hidden="true"
      className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-0 overflow-hidden p-0 py-0 [--card-spacing:0px] max-[1000px]:grid-cols-1 max-[700px]:rounded-2xl"
    >
      <div className="flex min-w-0 flex-col gap-4.5 px-7 py-6 max-[1000px]:p-5.5 max-[700px]:p-4.5 min-[2560px]:px-8.5 min-[2560px]:py-7.5">
        <div className="text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
          {t("title", { channel })}
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <Skeleton className="h-15 w-48 max-[700px]:h-11.5 max-[480px]:h-10" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="mt-auto">
          <Skeleton className="h-4 w-full rounded-sm" />
          <div className="mt-2.5 flex flex-wrap justify-between gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-l border-line px-7 py-6 max-[1000px]:border-t max-[1000px]:border-l-0 max-[1000px]:p-5.5 max-[700px]:grid-cols-1 max-[700px]:p-4.5 min-[2560px]:px-8.5 min-[2560px]:py-7.5">
        {([tProfit("prognosa"), tProfit("investment"), tProfit("arbitrage")] as const).map(
          (label, index) => (
            <div
              key={label}
              className="flex min-w-0 flex-col gap-4.5 px-5 first:pl-0 last:pr-0 [&+&]:border-l [&+&]:border-line max-[700px]:px-0 max-[700px]:py-3.5 max-[700px]:first:pt-0 max-[700px]:last:pb-0 max-[700px]:[&+&]:border-t max-[700px]:[&+&]:border-l-0"
            >
              <div className="text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
                {label}
              </div>
              <Skeleton
                className={
                  index === 2
                    ? "h-9 w-28"
                    : "h-9 w-32 before:invisible before:w-0 before:shrink-0 before:font-mono before:text-[3.75rem] before:leading-none before:content-['\\a0'] max-[700px]:before:hidden"
                }
              />
              <Skeleton className="mt-auto h-4 w-36 max-w-full" />
            </div>
          ),
        )}
      </div>
    </Card>
  );
}

function DecisionPanelSkeleton({ bucket }: { bucket: DecisionBucket }) {
  const t = useTranslations("home.decision");

  return (
    <section
      aria-hidden="true"
      className="flex min-w-0 flex-col gap-3 px-7 py-6 [&+&]:border-l [&+&]:border-line max-[1000px]:p-5.5 max-[1000px]:[&+&]:border-t max-[1000px]:[&+&]:border-l-0 max-[700px]:px-4.5 max-[700px]:py-5 min-[2560px]:px-8.5 min-[2560px]:py-7.5"
    >
      <div className="flex items-center justify-between">
        <Status
          tone={bucket}
          className="px-3.5 py-1.5 text-[0.9375rem] leading-normal"
        >
          {t(`captions.${bucket}`)}
        </Status>
        <Skeleton className="size-5 rounded-sm" />
      </div>
      <h2 className="mt-1.5 text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] font-bold tracking-tighter text-ink max-[700px]:text-[3.3rem] max-[480px]:text-[2.9rem]">
        {bucket.toUpperCase()}
      </h2>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <Skeleton className="h-9 w-36 max-[480px]:h-8" />
        {bucket === "route" ? <Skeleton className="h-5 w-48" /> : null}
      </div>
      <Skeleton className="h-5 w-full max-w-72" />
      <div className="mt-3 flex flex-col border-t border-line pt-4">
        <div className="mb-1.5 text-[0.875rem] font-semibold tracking-[0.06em] text-muted-text uppercase">
          {t("chartTitle")}
        </div>
        {GRAMS.map((gram) => (
          <div
            key={gram}
            className="grid min-h-6.5 grid-cols-[44px_minmax(0,1fr)_68px] items-center gap-3 text-base"
          >
            <span className="mono text-left text-[0.9375rem] text-muted-text">
              {gram}g
            </span>
            <Skeleton className="h-2 w-full rounded" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 text-base">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="size-4.5 rounded-sm" />
      </div>
    </section>
  );
}

function PriorityActionCardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="flex flex-row items-center gap-3.5 rounded-2xl px-5 py-4 max-[700px]:flex-wrap max-[700px]:gap-2.5 max-[700px]:px-3.5 max-[700px]:py-3.25 max-[480px]:items-start"
    >
      <Skeleton className="size-11 flex-none rounded-xl max-[480px]:size-10" />
      <div className="min-w-0 flex-1 max-[700px]:min-w-40">
        <Skeleton className="h-4.5 w-40 max-w-full" />
        <Skeleton className="mt-1.5 h-4 w-52 max-w-full" />
      </div>
      <Skeleton className="h-11 w-24 flex-none rounded-[999px] max-[700px]:ml-auto max-[480px]:ml-13.5 max-[480px]:w-[calc(100%-54px)]" />
    </Card>
  );
}

export function HomeScreenSkeleton() {
  const t = useTranslations("home");

  return (
    <div
      className="flex flex-col gap-4 min-[2560px]:gap-5.5 max-[1000px]:gap-3.5"
      aria-busy="true"
      aria-live="polite"
    >
      <ReadyInventoryCardSkeleton />
      <Card className="overflow-hidden p-0 py-0 [--card-spacing:0px]">
        <div className="grid grid-cols-3 max-[1000px]:grid-cols-1">
          {DECISION_BUCKETS.map((bucket) => (
            <DecisionPanelSkeleton key={bucket} bucket={bucket} />
          ))}
        </div>
      </Card>
      <section className="flex flex-col gap-2.5" aria-labelledby="priority-title">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="priority-title" className="m-0 text-[1.25rem] font-bold">
            {t("priorityTitle")}
          </h2>
          <span className="text-base font-semibold text-ink">{t("viewAll")}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-1 max-[700px]:gap-2.5">
          <PriorityActionCardSkeleton />
          <PriorityActionCardSkeleton />
          <PriorityActionCardSkeleton />
        </div>
      </section>
      <footer className="flex flex-wrap justify-between gap-2 text-[0.875rem] text-muted-text">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3.5 w-56" />
      </footer>
    </div>
  );
}
