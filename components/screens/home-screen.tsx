"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppFooter } from "@/components/molecules/app-footer";
import { Card } from "@/components/molecules/card";
import { DecisionPanel } from "@/components/organisms/decision-panel";
import { PriorityActionCard } from "@/components/organisms/priority-action-card";
import { ReadyInventoryCard } from "@/components/organisms/ready-inventory-card";
import type { DecisionBucket } from "@/domain/primitives";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useUIStore } from "@/stores/use-ui-store";

const DECISION_BUCKETS: DecisionBucket[] = ["sell", "route", "hold"];

export function HomeScreen() {
  const t = useTranslations("home");
  const tPriority = useTranslations("home.priority");
  const segment = useSettingsStore((state) => state.segment);
  const setDialog = useUIStore((state) => state.setDialog);
  const data = getHomeIntelligence(segment);
  const actions = data.actions
    .filter((action) => action.action === "WATCH" || action.action === "REPRICE")
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4 min-[2560px]:gap-5.5 max-[1000px]:gap-3.5">
      <ReadyInventoryCard
        data={data}
        segment={segment}
        onOpenEvidence={() => setDialog({ kind: "ready-inventory" })}
      />
      <Card className="overflow-hidden p-0 py-0 [--card-spacing:0px]">
        <div className="grid grid-cols-3 max-[1000px]:grid-cols-1">
          {DECISION_BUCKETS.map((bucket) => (
            <DecisionPanel
              key={bucket}
              bucket={bucket}
              data={data.buckets[bucket]}
              supplierSplit={
                bucket === "route" ? data.routeSuppliers : undefined
              }
              policyFloor={bucket === "hold" ? data.policyFloor : undefined}
              isComplete={data.isComplete}
              onClick={() =>
                setDialog({ kind: "bucket-evidence", bucket })
              }
            />
          ))}
        </div>
      </Card>
      <section
        className="flex flex-col gap-2.5"
        aria-labelledby="priority-title"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="priority-title" className="m-0 text-[1.25rem] font-bold">
            {t("priorityTitle")}
          </h2>
          <Link href="/actions" className="text-base font-semibold text-ink">
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-1 max-[700px]:gap-2.5">
          {actions.map((action) => (
            <PriorityActionCard
              key={action.id}
              action={action.action}
              title={tPriority(action.titleKey)}
              subtitle={tPriority(action.subtitleKey)}
              href={action.href}
            />
          ))}
        </div>
      </section>
      <AppFooter
        leftText={t("footerSnapshot", { date: data.snapshotDate })}
        rightText={t("footerSample", {
          count: data.invalidCount,
          sources: data.isComplete
            ? t("sourcesValid")
            : t("sourcesNeedReview"),
        })}
      />
    </div>
  );
}
