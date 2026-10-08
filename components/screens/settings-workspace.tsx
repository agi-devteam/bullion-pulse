"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Status } from "@/components/atoms/status";
import { Switch } from "@/components/atoms/switch";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/molecules/accordion";
import { Card } from "@/components/molecules/card";
import { Choice } from "@/components/molecules/choice";
import { FormRow } from "@/components/molecules/form-row";
import { Tabs, TabsList, TabsTrigger } from "@/components/molecules/tabs";
import { DataTable } from "@/components/organisms/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/organisms/dialog";
import { SettingsWorkspaceSkeleton } from "@/components/screens/settings-workspace-skeleton";
import { GRAMS, type Language, type Theme } from "@/domain/primitives";
import {
  MIN_REFRESH_SECONDS,
  type PolicyDraft,
  type SettingsTab,
  type SupplierPolicyQuote,
} from "@/domain/settings";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import { clonePolicyDraft } from "@/lib/settings/defaults";
import { useSaveSettings, useSettings } from "@/lib/query/hooks";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useUIStore } from "@/stores/use-ui-store";

const TAB_IDS: SettingsTab[] = [
  "dashboard",
  "margin",
  "route",
  "supplier",
  "system",
];

function numericInput(
  id: string,
  value: number,
  onChange: (value: number) => void,
  attrs: {
    min?: string;
    max?: string;
    step?: string;
    label?: string;
    className?: string;
  } = {},
) {
  return (
    <Input
      id={id}
      type="number"
      min={attrs.min ?? "0"}
      max={attrs.max}
      step={attrs.step ?? "any"}
      value={Number.isFinite(value) ? value : ""}
      aria-label={attrs.label}
      className={attrs.className}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

function groupQuotesBySupplier(quotes: SupplierPolicyQuote[]) {
  const groups: {
    supplierId: string;
    name: string;
    quotes: SupplierPolicyQuote[];
  }[] = [];
  const indexBySupplier = new Map<string, number>();

  for (const quote of quotes) {
    const existing = indexBySupplier.get(quote.supplierId);
    if (existing === undefined) {
      indexBySupplier.set(quote.supplierId, groups.length);
      groups.push({
        supplierId: quote.supplierId,
        name: quote.name,
        quotes: [quote],
      });
      continue;
    }
    groups[existing].quotes.push(quote);
  }

  for (const group of groups) {
    group.quotes.sort((a, b) => a.gram - b.gram);
  }

  return groups;
}

function SupplierPolicyAccordion({
  quotes,
  onQuoteChange,
}: {
  quotes: SupplierPolicyQuote[];
  onQuoteChange: (
    quoteId: string,
    patch: Partial<SupplierPolicyQuote>,
  ) => void;
}) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const groups = groupQuotesBySupplier(quotes);

  return (
    <Accordion
      multiple
      defaultValue={[]}
      className="gap-3"
    >
      {groups.map((group) => (
        <AccordionItem
          key={group.supplierId}
          value={group.supplierId}
          className="overflow-hidden rounded-md border border-line border-b bg-bg"
        >
          <AccordionHeader>
            <AccordionTrigger className="gap-4 px-4 py-3.5 text-[1.05rem] hover:bg-track/50">
              <span className="flex min-w-0 flex-1 items-baseline gap-2.5">
                <span>{group.name}</span>
                <span className="text-[0.8125rem] font-normal text-muted-text">
                  {tCommon("gramasiCount", { count: group.quotes.length })}
                </span>
              </span>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel contentClassName="space-y-2 bg-track/25 px-3 pb-3 pt-1">
            <Accordion multiple defaultValue={[]} className="gap-2">
              {group.quotes.map((quote) => (
                <AccordionItem
                  key={quote.quoteId}
                  value={String(quote.gram)}
                  className="overflow-hidden rounded-md border border-line border-b bg-surface"
                >
                  <AccordionHeader render={<h4 />}>
                    <AccordionTrigger className="gap-3 px-3.5 py-3 text-[0.9375rem] hover:bg-track/40">
                      <span className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span>{tCommon("gramsUnit", { value: quote.gram })}</span>
                        <Status tone={quote.active ? "sell" : ""}>
                          {quote.active
                            ? tCommon("active")
                            : tCommon("inactive")}
                        </Status>
                      </span>
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionPanel contentClassName="px-3.5 pb-1 pt-0">
                    <FormRow
                      label={t("supplier.active")}
                      id={`supplier-active-${quote.quoteId}`}
                    >
                      <Switch
                        id={`supplier-active-${quote.quoteId}`}
                        checked={quote.active}
                        onCheckedChange={(value) =>
                          onQuoteChange(quote.quoteId, { active: value })
                        }
                      />
                    </FormRow>
                    <FormRow
                      label={t("supplier.capacity")}
                      id={`supplier-capacity-${quote.quoteId}`}
                    >
                      <Input
                        id={`supplier-capacity-${quote.quoteId}`}
                        type="number"
                        min="0"
                        value={quote.capacity}
                        onChange={(event) =>
                          onQuoteChange(quote.quoteId, {
                            capacity: Number(event.target.value),
                          })
                        }
                      />
                    </FormRow>
                    <FormRow
                      label={t("supplier.leadTime")}
                      id={`supplier-lead-${quote.quoteId}`}
                    >
                      <Input
                        id={`supplier-lead-${quote.quoteId}`}
                        type="number"
                        min="0"
                        value={quote.leadTime}
                        onChange={(event) =>
                          onQuoteChange(quote.quoteId, {
                            leadTime: Number(event.target.value),
                          })
                        }
                      />
                    </FormRow>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function SettingsWorkspace() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const tab = useUIStore((state) => state.settingsTab);
  const setTab = useUIStore((state) => state.setSettingsTab);
  const setDialog = useUIStore((state) => state.setDialog);
  const showToast = useUIStore((state) => state.showToast);
  const settingsQuery = useSettings({ theme, language });
  const saveSettings = useSaveSettings();
  const [draft, setDraft] = useState<PolicyDraft | null>(null);
  const committed = useRef<PolicyDraft | null>(null);
  const [pendingTab, setPendingTab] = useState<SettingsTab | null>(null);
  const [refreshAlertOpen, setRefreshAlertOpen] = useState(false);

  useEffect(() => {
    if (!settingsQuery.data || committed.current != null) return;
    const next = clonePolicyDraft({
      ...settingsQuery.data,
      display: { theme, language },
    });
    setDraft(next);
    committed.current = clonePolicyDraft(next);
  }, [settingsQuery.data, theme, language]);

  const tabLabels: Record<SettingsTab, string> = {
    dashboard: t("tabs.dashboard"),
    margin: t("tabs.margin"),
    route: t("tabs.route"),
    supplier: t("tabs.supplier"),
    system: t("tabs.system"),
  };

  function isDirty() {
    if (!draft || !committed.current) return false;
    return JSON.stringify(draft) !== JSON.stringify(committed.current);
  }

  function updateDraft(updater: (current: PolicyDraft) => PolicyDraft) {
    setDraft((current) => (current ? updater(current) : current));
  }

  function commitDisplay<K extends keyof PolicyDraft["display"]>(
    key: K,
    value: PolicyDraft["display"][K],
  ) {
    updateDraft((current) => ({
      ...current,
      display: { ...current.display, [key]: value },
    }));
    if (committed.current) {
      committed.current = {
        ...committed.current,
        display: { ...committed.current.display, [key]: value },
      };
    }
  }

  function requestTabChange(next: SettingsTab) {
    if (next === tab) return;
    if (!isDirty()) {
      setTab(next);
      return;
    }
    setPendingTab(next);
  }

  function discardAndSwitch() {
    if (!pendingTab || !committed.current) return;
    const next = clonePolicyDraft(committed.current);
    setDraft(next);
    setTheme(next.display.theme);
    setLanguage(next.display.language);
    setTab(pendingTab);
    setPendingTab(null);
    showToast(t("toasts.discarded"));
  }

  function setQuote(quoteId: string, patch: Partial<SupplierPolicyQuote>) {
    updateDraft((current) => ({
      ...current,
      supplier: {
        quotes: current.supplier.quotes.map((quote) =>
          quote.quoteId === quoteId ? { ...quote, ...patch } : quote,
        ),
      },
    }));
  }

  function discard() {
    if (!committed.current) return;
    const next = clonePolicyDraft(committed.current);
    setDraft(next);
    setTheme(next.display.theme);
    setLanguage(next.display.language);
    showToast(t("toasts.discarded"));
  }

  function preview() {
    const home = getHomeIntelligence("all");
    const current = {
      sell: home.buckets.sell.grams,
      route: home.buckets.route.grams,
      hold: home.buckets.hold.grams,
    };
    // Reference re-runs analyze(draft) vs analyze(saved). Until a policy
    // engine exists here, only approximate impact when the draft is dirty.
    const next = isDirty()
      ? {
          sell: Math.round(current.sell * 0.985),
          route: Math.round(current.route * 1.08),
          hold: Math.round(current.hold * 1.12),
        }
      : { ...current };
    setDialog({ kind: "policy-preview", current, next });
  }

  async function persist() {
    if (!draft || saveSettings.isPending) return;

    for (const gram of GRAMS) {
      for (const channel of ["B2C", "B2B"] as const) {
        const value = draft.margin.minimumMargin[channel][gram];
        if (!Number.isFinite(value) || value < 0 || value >= 100) {
          showToast(t("toasts.marginRange"));
          return;
        }
      }
    }

    if (
      !Number.isFinite(draft.route.minimumMargin) ||
      draft.route.minimumMargin < 0 ||
      draft.route.minimumMargin >= 100 ||
      !Number.isFinite(draft.route.maxLeadHours) ||
      draft.route.maxLeadHours < 0
    ) {
      showToast(t("toasts.routeInvalid"));
      return;
    }

    if (
      !Number.isFinite(draft.system.refreshSeconds) ||
      draft.system.refreshSeconds < MIN_REFRESH_SECONDS
    ) {
      setRefreshAlertOpen(true);
      return;
    }

    for (const quote of draft.supplier.quotes) {
      if (
        !Number.isFinite(quote.capacity) ||
        quote.capacity < 0 ||
        !Number.isFinite(quote.leadTime) ||
        quote.leadTime < 0
      ) {
        showToast(t("toasts.supplierInvalid"));
        return;
      }
    }

    try {
      await saveSettings.mutateAsync(draft);
      committed.current = clonePolicyDraft(draft);
      setTheme(draft.display.theme);
      setLanguage(draft.display.language);
      showToast(t("toasts.saved"));
    } catch {
      showToast(t("toasts.saveFailed"));
    }
  }

  if (!draft) {
    if (settingsQuery.isError) {
      return (
        <Card className="policy-matrix block gap-0 p-6">
          <p className="m-0 mb-4 text-[0.95rem] text-muted-text">
            {t("loadFailed")}
          </p>
          <Button
            type="button"
            onClick={() => void settingsQuery.refetch()}
            disabled={settingsQuery.isFetching}
          >
            {settingsQuery.isFetching ? t("loading") : tCommon("retry")}
          </Button>
        </Card>
      );
    }

    return <SettingsWorkspaceSkeleton />;
  }

  return (
    <div className="flex flex-col gap-5.5">
      <nav aria-label={t("tabsNav")} className="flex flex-wrap gap-2">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (value) requestTabChange(value as SettingsTab);
          }}
          className="gap-0"
        >
          <TabsList className="gap-2">
            {TAB_IDS.map((id) => (
              <TabsTrigger key={id} value={id} className="min-h-11 py-0">
                {tabLabels[id]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </nav>
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void persist();
        }}
      >
        <Card className="policy-matrix block gap-0 p-6">
          <h2 className="mt-0 mb-4.5 text-[1.25rem] font-bold">
            {tabLabels[tab]}
          </h2>
          {tab === "dashboard" ? (
            <>
              <FormRow
                label={t("dashboard.theme")}
                id="theme"
                note={t("dashboard.themeNote")}
                controlWidth={210}
              >
                <Choice
                  label={t("dashboard.theme")}
                  value={draft.display.theme}
                  onChange={(value) => {
                    const next = value as Theme;
                    commitDisplay("theme", next);
                    setTheme(next);
                  }}
                  options={[
                    ["system", t("dashboard.themeSystem")],
                    ["light", t("dashboard.themeLight")],
                    ["dark", t("dashboard.themeDark")],
                  ]}
                />
              </FormRow>
              <FormRow
                label={t("dashboard.language")}
                id="language"
                note={t("dashboard.languageNote")}
                controlWidth={210}
              >
                <Choice
                  label={t("dashboard.language")}
                  value={draft.display.language}
                  onChange={(value) => {
                    const next = value as Language;
                    commitDisplay("language", next);
                    setLanguage(next);
                  }}
                  options={[
                    ["id", t("dashboard.languageId")],
                    ["en", t("dashboard.languageEn")],
                  ]}
                />
              </FormRow>
            </>
          ) : null}
          {tab === "margin" ? (
            <>
              <p className="mt-0 mb-3.5 text-[0.95rem] leading-normal text-muted-text">
                {t("margin.intro")}
              </p>
              <DataTable
                headers={[
                  t("margin.gramasi"),
                  t("margin.b2cMin"),
                  t("margin.b2bMin"),
                ]}
                rows={GRAMS.map((gram) => [
                  tCommon("gramsUnit", { value: gram }),
                  numericInput(
                    `margin-B2C-${gram}`,
                    draft.margin.minimumMargin.B2C[gram],
                    (value) =>
                      updateDraft((current) => ({
                        ...current,
                        margin: {
                          minimumMargin: {
                            ...current.margin.minimumMargin,
                            B2C: {
                              ...current.margin.minimumMargin.B2C,
                              [gram]: value,
                            },
                          },
                        },
                      })),
                    {
                      max: "99.99",
                      step: "0.1",
                      label: t("margin.b2cAria", { gram }),
                    },
                  ),
                  numericInput(
                    `margin-B2B-${gram}`,
                    draft.margin.minimumMargin.B2B[gram],
                    (value) =>
                      updateDraft((current) => ({
                        ...current,
                        margin: {
                          minimumMargin: {
                            ...current.margin.minimumMargin,
                            B2B: {
                              ...current.margin.minimumMargin.B2B,
                              [gram]: value,
                            },
                          },
                        },
                      })),
                    {
                      max: "99.99",
                      step: "0.1",
                      label: t("margin.b2bAria", { gram }),
                    },
                  ),
                ])}
              />
            </>
          ) : null}
          {tab === "route" ? (
            <>
              <FormRow label={t("route.minMargin")} id="route-margin">
                {numericInput(
                  "route-margin",
                  draft.route.minimumMargin,
                  (value) =>
                    updateDraft((current) => ({
                      ...current,
                      route: { ...current.route, minimumMargin: value },
                    })),
                  { max: "99.99", step: "0.1" },
                )}
              </FormRow>
              <FormRow label={t("route.maxLead")} id="route-lead">
                {numericInput(
                  "route-lead",
                  draft.route.maxLeadHours,
                  (value) =>
                    updateDraft((current) => ({
                      ...current,
                      route: { ...current.route, maxLeadHours: value },
                    })),
                )}
              </FormRow>
              <FormRow
                label={t("route.capacityRequired")}
                id="route-capacity"
                note={t("route.capacityNote")}
              >
                <Switch
                  id="route-capacity"
                  checked={draft.route.capacityRequired}
                  onCheckedChange={(value) =>
                    updateDraft((current) => ({
                      ...current,
                      route: { ...current.route, capacityRequired: value },
                    }))
                  }
                />
              </FormRow>
              <FormRow
                label={t("route.lockRequired")}
                note={t("route.lockNote")}
              >
                <Status tone="route">{tCommon("required")}</Status>
              </FormRow>
            </>
          ) : null}
          {tab === "supplier" ? (
            <SupplierPolicyAccordion
              quotes={draft.supplier.quotes}
              onQuoteChange={setQuote}
            />
          ) : null}
          {tab === "system" ? (
            <>
              <FormRow label={t("system.dayStart")} id="day-start">
                <Input
                  id="day-start"
                  type="time"
                  value={draft.system.businessDayStart}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      system: {
                        ...current.system,
                        businessDayStart: event.target.value,
                      },
                    }))
                  }
                />
              </FormRow>
              <FormRow
                label={t("system.refresh")}
                id="refresh-seconds"
                note={t("system.refreshNote")}
              >
                {numericInput(
                  "refresh-seconds",
                  draft.system.refreshSeconds,
                  (value) =>
                    updateDraft((current) => ({
                      ...current,
                      system: { ...current.system, refreshSeconds: value },
                    })),
                  { min: String(MIN_REFRESH_SECONDS) },
                )}
              </FormRow>
              <FormRow
                label={t("system.antamSource")}
                id="antam-source"
                note={t("system.antamSourceNote")}
              >
                <a
                  href={draft.system.antamSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline"
                >
                  {t("system.antamLink")}
                </a>
              </FormRow>
            </>
          ) : null}
        </Card>
        {tab !== "dashboard" && isDirty() ? (
          <div className="mt-4.5 flex flex-wrap items-center justify-between gap-3.5">
            <p className="m-0 text-[0.95rem] leading-normal text-muted-text">
              {t("footerNote")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {tab === "margin" || tab === "route" ? (
                <Button type="button" variant="outline" onClick={preview}>
                  {t("previewImpact")}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={discard}
                disabled={saveSettings.isPending}
              >
                {tCommon("discard")}
              </Button>
              <Button type="submit" disabled={saveSettings.isPending}>
                {saveSettings.isPending ? t("saving") : tCommon("save")}
              </Button>
            </div>
          </div>
        ) : null}
      </form>

      <Dialog
        open={pendingTab != null}
        onOpenChange={(open) => {
          if (!open) setPendingTab(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-[1.15rem] font-semibold">
              {t("unsavedTitle")}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-text">
              {t("unsavedDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingTab(null)}
            >
              {t("unsavedStay")}
            </Button>
            <Button type="button" onClick={discardAndSwitch}>
              {t("unsavedDiscard")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refreshAlertOpen} onOpenChange={setRefreshAlertOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-[1.15rem] font-semibold">
              {t("refreshTooLowTitle")}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-text">
              {t("refreshTooLowDescription", {
                min: MIN_REFRESH_SECONDS,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-end">
            <Button type="button" onClick={() => setRefreshAlertOpen(false)}>
              {tCommon("ok")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
