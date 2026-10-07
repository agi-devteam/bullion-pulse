"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Switch } from "@/components/atoms/switch";
import { Card } from "@/components/molecules/card";
import { Choice } from "@/components/molecules/choice";
import { FormRow } from "@/components/molecules/form-row";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/molecules/tabs";
import { DataTable } from "@/components/organisms/data-table";
import { GRAMS, type Language, type Theme } from "@/domain/primitives";
import type { PolicyDraft, SettingsTab, SupplierPolicyQuote } from "@/domain/settings";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import {
  clonePolicyDraft,
  createDefaultPolicyDraft,
} from "@/lib/settings/defaults";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useUIStore } from "@/stores/use-ui-store";

const TAB_LABELS: { id: SettingsTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "margin", label: "Margin Policy" },
  { id: "route", label: "Route Policy" },
  { id: "supplier", label: "Supplier Policy" },
  { id: "system", label: "System / Market" },
];

function groupQuotes(quotes: SupplierPolicyQuote[]) {
  const groups = new Map<string, SupplierPolicyQuote[]>();

  for (const quote of quotes) {
    const list = groups.get(quote.name) ?? [];
    list.push(quote);
    groups.set(quote.name, list);
  }

  for (const list of groups.values()) {
    list.sort((a, b) => a.gram - b.gram);
  }

  return groups;
}

function numericInput(
  id: string,
  value: number,
  onChange: (value: number) => void,
  attrs: { min?: string; max?: string; step?: string; label?: string } = {},
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
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
}

export function SettingsWorkspace() {
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

  const groupedSuppliers = useMemo(
    () => groupQuotes(draft.supplier.quotes),
    [draft.supplier.quotes],
  );

  function patchDisplay<K extends keyof PolicyDraft["display"]>(
    key: K,
    value: PolicyDraft["display"][K],
  ) {
    setDraft((current) => ({
      ...current,
      display: { ...current.display, [key]: value },
    }));
  }

  function setQuote(
    quoteId: string,
    patch: Partial<SupplierPolicyQuote>,
  ) {
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
    setDraft(clonePolicyDraft(committed.current));
    showToast("Perubahan dibatalkan.");
  }

  function preview() {
    const current = getHomeIntelligence("all");
    setDialog({
      kind: "policy-preview",
      next: {
        sell: Math.round(current.buckets.sell.grams * 0.985),
        route: Math.round(current.buckets.route.grams * 1.08),
        hold: Math.round(current.buckets.hold.grams * 1.12),
      },
    });
  }

  function persist() {
    for (const gram of GRAMS) {
      for (const channel of ["B2C", "B2B"] as const) {
        const value = draft.margin.minimumMargin[channel][gram];
        if (!Number.isFinite(value) || value < 0 || value >= 100) {
          showToast("Margin policy harus berada di 0–99.99%");
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
      showToast("Nilai route policy invalid");
      return;
    }

    if (draft.system.refreshSeconds < 1 || draft.system.staleMinutes < 1) {
      showToast("Nilai policy di luar range");
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
        showToast("Supplier capacity, lead time, dan expiry harus valid.");
        return;
      }
    }

    committed.current = clonePolicyDraft(draft);
    setTheme(draft.display.theme);
    setLanguage(draft.display.language);
    showToast("Pengaturan disimpan.");
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value) setTab(value as SettingsTab);
        }}
      >
        <TabsList>
          {TAB_LABELS.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <form
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            persist();
          }}
          className="flex flex-col gap-6"
        >
          <Card className="block p-6">
            <h2 className="mt-0 mb-[18px] text-[1.25rem] font-semibold">
              {TAB_LABELS.find((item) => item.id === tab)?.label}
            </h2>
            <TabsContent value="dashboard">
              <FormRow
                label="Theme"
                id="theme"
                note="Theme control hanya berada di Settings."
              >
                <Choice
                  label="Theme"
                  value={draft.display.theme}
                  onChange={(value) => patchDisplay("theme", value as Theme)}
                  options={[
                    ["system", "System"],
                    ["light", "Light"],
                    ["dark", "Dark"],
                  ]}
                />
              </FormRow>
              <FormRow label="Language" id="language">
                <Choice
                  label="Language"
                  value={draft.display.language}
                  onChange={(value) =>
                    patchDisplay("language", value as Language)
                  }
                  options={[
                    ["id", "Indonesia (id)"],
                    ["en", "English (en)"],
                  ]}
                />
              </FormRow>
            </TabsContent>
            <TabsContent value="margin">
              <p className="mb-4 text-[0.9375rem] text-muted-text">
                Default B2C 3% / B2B 2.5% untuk seluruh gramasi. Margin = total GP
                / harga jual; bukan hanya komponen Prognosa.
              </p>
              <DataTable
                headers={["Gramasi", "B2C minimum %", "B2B minimum %"]}
                rows={GRAMS.map((gram) => [
                  `${gram}g`,
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
                      label: `B2C ${gram}g minimum margin`,
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
                      label: `B2B ${gram}g minimum margin`,
                    },
                  ),
                ])}
              />
            </TabsContent>
            <TabsContent value="route">
              <FormRow label="Minimum routed margin %" id="route-margin">
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
              <FormRow label="Maximum lead time (hours)" id="route-lead">
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
                label="Supplier capacity requirement"
                id="route-capacity"
                note="Capacity tetap wajib pada tahap execution."
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
            </TabsContent>
            <TabsContent value="supplier">
              {[...groupedSuppliers.entries()].map(
                ([name, quotes], supplierIndex) => (
                  <section
                    key={name}
                    className={
                      supplierIndex > 0
                        ? "mt-7 border-t border-line pt-6"
                        : undefined
                    }
                  >
                    <h3 className="mt-0 mb-2.5 text-[1.1rem] font-semibold">
                      {name}
                    </h3>
                    {quotes.map((quote) => (
                      <div key={quote.quote_id} className="mb-4 last:mb-0">
                        <h4 className="mt-0 mb-1 text-base font-semibold">
                          {quote.gram}g
                        </h4>
                        <FormRow
                          label="Active"
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
                          label="Capacity (gram)"
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
                          label="Lead time (hours)"
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
                          label="Quote expiry"
                          id={`supplier-expiry-${quote.quote_id}`}
                          note="UTC · sample quote expiry."
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
                      </div>
                    ))}
                  </section>
                ),
              )}
            </TabsContent>
            <TabsContent value="system">
              <FormRow label="Business day start · WIB" id="day-start">
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
                label="Refresh interval (seconds)"
                id="refresh-seconds"
                note="Refresh evaluasi; bukan koneksi feed live."
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
              <FormRow
                label="Freshness threshold (minutes)"
                id="stale-minutes"
              >
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
                label="ANTAM official source"
                id="antam-source"
                note="Official source only · no fallback."
              >
                <a
                  href={draft.system.antamSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline"
                >
                  logammulia.com
                </a>
              </FormRow>
              <FormRow
                label="XAU market awareness"
                id="xau-enabled"
                note="XAU tidak masuk operational decision engine."
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
            </TabsContent>
          </Card>
          <div className="flex flex-wrap items-center justify-between gap-[18px]">
            <p className="m-0 text-[0.9375rem] text-muted-text">
              Perubahan berlaku setelah Save. Pengaturan disimpan pada browser
              ini.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={preview}>
                Preview Policy Impact
              </Button>
              <Button type="button" variant="outline" onClick={discard}>
                Discard
              </Button>
              <Button type="button" onClick={persist}>
                Save settings
              </Button>
            </div>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
