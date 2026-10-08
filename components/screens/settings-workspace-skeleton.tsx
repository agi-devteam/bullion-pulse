"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/molecules/card";
import { FormRowSkeleton } from "@/components/molecules/form-row-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/molecules/tabs";
import type { SettingsTab } from "@/domain/settings";

const TAB_IDS: SettingsTab[] = [
  "dashboard",
  "margin",
  "route",
  "supplier",
  "system",
];

export function SettingsWorkspaceSkeleton() {
  const t = useTranslations("settings");

  const tabLabels: Record<SettingsTab, string> = {
    dashboard: t("tabs.dashboard"),
    margin: t("tabs.margin"),
    route: t("tabs.route"),
    supplier: t("tabs.supplier"),
    system: t("tabs.system"),
  };

  return (
    <div className="flex flex-col gap-5.5" aria-busy="true" aria-live="polite">
      <nav aria-label={t("tabsNav")} className="flex flex-wrap gap-2">
        <Tabs value="dashboard" className="gap-0">
          <TabsList className="gap-2">
            {TAB_IDS.map((id) => (
              <TabsTrigger
                key={id}
                value={id}
                className="min-h-11 py-0"
                disabled
              >
                {tabLabels[id]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </nav>
      <Card className="policy-matrix block gap-0 p-6">
        <h2 className="mt-0 mb-4.5 text-[1.25rem] font-bold">
          {tabLabels.dashboard}
        </h2>
        <FormRowSkeleton controlWidth={210} withNote />
        <FormRowSkeleton controlWidth={210} withNote />
      </Card>
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
