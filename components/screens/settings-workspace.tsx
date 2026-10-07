"use client";

import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Status } from "@/components/atoms/status";
import { Switch } from "@/components/atoms/switch";
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
import { GRAMS, type Language, type Theme } from "@/domain/primitives";
import type {
  PolicyDraft,
  SettingsTab,
  SupplierPolicyQuote,
} from "@/domain/settings";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import {
  clonePolicyDraft,
  createDefaultPolicyDraft,
} from "@/lib/settings/defaults";
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
  const [draft, setDraft] = useState<PolicyDraft>(() =>
    createDefaultPolicyDraft({ theme, language }),
  );
  const committed = useRef(clonePolicyDraft(draft));
  const [pendingTab, setPendingTab] = useState<SettingsTab | null>(null);

  const tabLabels: Record<SettingsTab, string> = {
    dashboard: t("tabs.dashboard"),
    margin: t("tabs.margin"),
    route: t("tabs.route"),
    supplier: t("tabs.supplier"),
    system: t("tabs.system"),
  };

  function isDirty() {
    return JSON.stringify(draft) !== JSON.stringify(committed.current);
  }

  function commitDisplay<K extends keyof PolicyDraft["display"]>(
    key: K,
    value: PolicyDraft["display"][K],
  ) {
    setDraft((current) => ({
      ...current,
      display: { ...current.display, [key]: value },
    }));
    committed.current = {
      ...committed.current,
      display: { ...committed.current.display, [key]: value },
    };
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
    if (!pendingTab) return;
    const next = clonePolicyDraft(committed.current);
    setDraft(next);
    setTheme(next.display.theme);
    setLanguage(next.display.language);
    setTab(pendingTab);
    setPendingTab(null);
    showToast(t("toasts.discarded"));
  }

  function setQuote(quoteId: string, patch: Partial<SupplierPolicyQuote>) {
    setDraft((current) => ({
      ...current,
      supplier: {
        quotes: current.supplier.quotes.map((quote) =>
          quote.quote_id === quoteId ? { ...quote, ...patch } : quote,
        ),
      },
    }));
  }

  function discard() {
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

  function persist() {
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

    if (draft.system.refreshSeconds < 1 || draft.system.staleMinutes < 1) {
      showToast(t("toasts.outOfRange"));
      return;
    }

    for (const quote of draft.supplier.quotes) {
      if (
        !Number.isFinite(quote.capacity) ||
        quote.capacity < 0 ||
        !Number.isFinite(quote.lead_time) ||
        quote.lead_time < 0 ||
        !Number.isFinite(Date.parse(quote.valid_until))
      ) {
        showToast(t("toasts.supplierInvalid"));
        return;
      }
    }

    committed.current = clonePolicyDraft(draft);
    setTheme(draft.display.theme);
    setLanguage(draft.display.language);
    showToast(t("toasts.saved"));
  }

  return (
    <div className="flex flex-col gap-[22px]">
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
              <TabsTrigger key={id} value={id} className="min-h-[44px] py-0">
                {tabLabels[id]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </nav>
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          persist();
        }}
      >
        <Card className="policy-matrix block gap-0 p-[24px]">
          <h2 className="mt-0 mb-[18px] text-[1.25rem] font-bold">
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
              <p className="mt-0 mb-[14px] text-[0.95rem] leading-[1.5] text-muted-text">
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
                      setDraft((current) => ({
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
                      setDraft((current) => ({
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
                    setDraft((current) => ({
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
                    setDraft((current) => ({
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
                    setDraft((current) => ({
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
          {tab === "supplier"
            ? draft.supplier.quotes.map((quote, index) => (
                <section
                  key={quote.quote_id}
                  className={
                    index > 0 ? "mt-7 border-t border-line pt-6" : undefined
                  }
                >
                  <h3 className="mt-0 mb-2.5 text-[1.1rem] font-semibold">
                    {t("supplier.quoteHeading", {
                      name: quote.name,
                      gram: quote.gram,
                    })}
                  </h3>
                  <FormRow
                    label={t("supplier.active")}
                    id={`supplier-active-${quote.quote_id}`}
                  >
                    <Switch
                      id={`supplier-active-${quote.quote_id}`}
                      checked={quote.active}
                      onCheckedChange={(value) =>
                        setQuote(quote.quote_id, { active: value })
                      }
                    />
                  </FormRow>
                  <FormRow
                    label={t("supplier.capacity")}
                    id={`supplier-capacity-${quote.quote_id}`}
                  >
                    <Input
                      id={`supplier-capacity-${quote.quote_id}`}
                      type="number"
                      min="0"
                      value={quote.capacity}
                      onChange={(event) =>
                        setQuote(quote.quote_id, {
                          capacity: Number(event.target.value),
                        })
                      }
                    />
                  </FormRow>
                  <FormRow
                    label={t("supplier.leadTime")}
                    id={`supplier-lead-${quote.quote_id}`}
                  >
                    <Input
                      id={`supplier-lead-${quote.quote_id}`}
                      type="number"
                      min="0"
                      value={quote.lead_time}
                      onChange={(event) =>
                        setQuote(quote.quote_id, {
                          lead_time: Number(event.target.value),
                        })
                      }
                    />
                  </FormRow>
                  <FormRow
                    label={t("supplier.expiry")}
                    id={`supplier-expiry-${quote.quote_id}`}
                    note={t("supplier.expiryNote")}
                  >
                    <Input
                      id={`supplier-expiry-${quote.quote_id}`}
                      type="datetime-local"
                      value={quote.valid_until.slice(0, 16)}
                      onChange={(event) =>
                        setQuote(quote.quote_id, {
                          valid_until: event.target.value
                            ? `${event.target.value}:00.000Z`
                            : "",
                        })
                      }
                    />
                  </FormRow>
                </section>
              ))
            : null}
          {tab === "system" ? (
            <>
              <FormRow label={t("system.dayStart")} id="day-start">
                <Input
                  id="day-start"
                  type="time"
                  value={draft.system.businessDayStart}
                  onChange={(event) =>
                    setDraft((current) => ({
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
                    setDraft((current) => ({
                      ...current,
                      system: { ...current.system, refreshSeconds: value },
                    })),
                  { min: "1" },
                )}
              </FormRow>
              <FormRow label={t("system.freshness")} id="stale-minutes">
                {numericInput(
                  "stale-minutes",
                  draft.system.staleMinutes,
                  (value) =>
                    setDraft((current) => ({
                      ...current,
                      system: { ...current.system, staleMinutes: value },
                    })),
                  { min: "1" },
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
              <FormRow
                label={t("system.xau")}
                id="xau-enabled"
                note={t("system.xauNote")}
              >
                <Switch
                  id="xau-enabled"
                  checked={draft.system.xauEnabled}
                  onCheckedChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      system: { ...current.system, xauEnabled: value },
                    }))
                  }
                />
              </FormRow>
            </>
          ) : null}
        </Card>
        {tab !== "dashboard" && isDirty() ? (
          <div className="mt-[18px] flex flex-wrap items-center justify-between gap-[14px]">
            <p className="m-0 text-[0.95rem] leading-[1.5] text-muted-text">
              {t("footerNote")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {tab === "margin" || tab === "route" ? (
                <Button type="button" variant="outline" onClick={preview}>
                  {t("previewImpact")}
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={discard}>
                {tCommon("discard")}
              </Button>
              <Button type="submit">{tCommon("save")}</Button>
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
    </div>
  );
}
