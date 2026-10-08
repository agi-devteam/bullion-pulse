"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/card";
import { DecisionPanel } from "@/components/organisms/decision-panel";
import { PriorityActionCard } from "@/components/organisms/priority-action-card";
import { ReadyInventoryCard } from "@/components/organisms/ready-inventory-card";
import { HomeScreenSkeleton } from "@/components/screens/home-screen-skeleton";
import type { DecisionBucket, Segment } from "@/domain/primitives";
import type { HomeIntelligence } from "@/domain/intelligence";
import { useIntelligence } from "@/lib/query/hooks";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useUIStore } from "@/stores/use-ui-store";

const DECISION_BUCKETS: DecisionBucket[] = ["sell", "route", "hold"];

function HomeScreenContent({
  data,
  segment,
}: {
  data: HomeIntelligence;
  segment: Segment;
}) {
  const t = useTranslations("home");
  const tPriority = useTranslations("home.priority");
  const setDialog = useUIStore((state) => state.setDialog);
  const [barMotionReady, setBarMotionReady] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setBarMotionReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const actions = data.actions
    .filter((action) => action.action === "WATCH")
    .slice(0, 3);

  return (
    <div
      className="flex flex-col gap-4 min-[2560px]:gap-5.5 max-[1000px]:gap-3.5"
      data-motion={barMotionReady ? "live" : "instant"}
    >
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
              onClick={() => setDialog({ kind: "bucket-evidence", bucket })}
            />
          ))}
        </div>
      </Card>
      {actions.length > 0 ? (
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
      ) : null}
    </div>
  );
}

export function HomeScreen() {
  const segment = useSettingsStore((state) => state.segment);
  const intelligenceQuery = useIntelligence(segment);

  if (intelligenceQuery.isPending || !intelligenceQuery.data) {
    return <HomeScreenSkeleton />;
  }

  return (
    <HomeScreenContent
      key={segment}
      data={intelligenceQuery.data}
      segment={segment}
    />
  );
}
