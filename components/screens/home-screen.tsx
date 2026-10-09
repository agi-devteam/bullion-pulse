"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/card";
import { DecisionPanel } from "@/components/organisms/decision-panel";
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
  const setDialog = useUIStore((state) => state.setDialog);
  const [barMotionReady, setBarMotionReady] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setBarMotionReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

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
    </div>
  );
}

export function HomeScreen() {
  const t = useTranslations("home.ready");
  const segment = useSettingsStore((state) => state.segment);
  const intelligenceQuery = useIntelligence(segment);

  if (intelligenceQuery.isPending) {
    return <HomeScreenSkeleton />;
  }

  if (!intelligenceQuery.data) {
    return (
      <Card className="block gap-0 p-6">
        <p className="m-0 text-[0.95rem] text-muted-text">{t("unavailable")}</p>
      </Card>
    );
  }

  return (
    <HomeScreenContent
      key={segment}
      data={intelligenceQuery.data}
      segment={segment}
    />
  );
}
