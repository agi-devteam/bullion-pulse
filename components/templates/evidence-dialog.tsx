"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/button";
import { Evidence } from "@/components/molecules/evidence";
import { Metric } from "@/components/molecules/metric";
import { DataTable } from "@/components/organisms/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/organisms/dialog";
import { formatIdr, compactRupiah, formatNumber, formatPercent } from "@/lib/format/money";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import { getActionAlerts, getInventoryRecord } from "@/lib/mocks/workspace";
import { useSettingsStore } from "@/stores/use-settings-store";
import { useUIStore } from "@/stores/use-ui-store";

function DialogShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const t = useTranslations("evidence");
  const setDialog = useUIStore((state) => state.setDialog);

  return (
    <DialogContent showCloseButton={false} className="w-170">
      <DialogClose
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2"
            aria-label={t("close")}
          />
        }
        onClick={() => setDialog(null)}
      >
        <XIcon aria-hidden="true" />
      </DialogClose>
      <DialogHeader>
        <DialogTitle className="text-[1.15rem] font-semibold">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="text-base text-muted-text">
            {description}
          </DialogDescription>
        ) : null}
      </DialogHeader>
      {children}
    </DialogContent>
  );
}

export function EvidenceDialog() {
  const dialog = useUIStore((state) => state.dialog);
  const setDialog = useUIStore((state) => state.setDialog);
  const setActionStatus = useUIStore((state) => state.setActionStatus);
  const showToast = useUIStore((state) => state.showToast);
  const segment = useSettingsStore((state) => state.segment);
  const t = useTranslations("evidence");
  const tActions = useTranslations("actions");
  const tCommon = useTranslations("common");
  const home = getHomeIntelligence(segment);
  const open = dialog != null;
  const bucket = dialog?.kind === "bucket-evidence" ? dialog.bucket : null;
  const profit = bucket ? home.buckets[bucket].profit : home.profit;
  const unit =
    dialog?.kind === "inventory-unit"
      ? getInventoryRecord(dialog.stockId)
      : undefined;
  const actionAlert =
    dialog?.kind === "action-alert"
      ? getActionAlerts().find((alert) => alert.id === dialog.alertId)
      : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setDialog(null);
        }
      }}
    >
      {dialog?.kind === "inventory-unit" ? (
        <DialogShell
          title={t("inventoryTitle", {
            id: dialog.serial ?? dialog.stockId,
          })}
          description={t("sharedDescription")}
        >
          {unit ? (
            <Evidence
              rows={[
                [t("rows.stockId"), unit.stock_id],
                [
                  t("rows.channelGram"),
                  `${unit.channel} · ${unit.gram}g`,
                ],
                [
                  t("rows.productionKeeper"),
                  `${unit.production} · ${unit.stock_keeper}`,
                ],
                [
                  t("rows.availability"),
                  t("rows.availabilityValue", {
                    status: unit.availability_status,
                    reserved: unit.reserved
                      ? tCommon("yes")
                      : tCommon("no"),
                  }),
                ],
                [
                  t("rows.hppUnit"),
                  formatIdr(unit.unit_cost > 0 ? unit.unit_cost : null),
                ],
                [
                  t("rows.purchasePriceUnit"),
                  formatIdr(
                    unit.purchase_price > 0 ? unit.purchase_price : null,
                  ),
                ],
                [t("rows.sellingPrice"), formatIdr(unit.selling_price)],
                [
                  t("rows.totalGpMargin"),
                  unit.direct_gp != null && unit.direct_margin != null
                    ? `${formatIdr(unit.direct_gp)} / ${formatPercent(unit.direct_margin)}`
                    : tCommon("emDash"),
                ],
                [
                  t("rows.marketAtPurchase"),
                  formatIdr(unit.market_at_purchase),
                ],
                [t("rows.marketNowAntam"), formatIdr(unit.market_at_sale)],
                [t("rows.prognosaEstimate"), formatIdr(unit.profit.prognosa)],
                [
                  t("rows.investmentEstimate"),
                  formatIdr(unit.profit.investment),
                ],
                [
                  t("rows.arbitrageEstimate"),
                  formatIdr(unit.profit.arbitrage),
                ],
                [
                  t("rows.policy"),
                  unit.policyMargin == null
                    ? tCommon("emDash")
                    : formatPercent(unit.policyMargin),
                ],
                [
                  t("rows.decisionAction"),
                  `${unit.decision ?? tCommon("decisions.excludedUnpriced")} · ${unit.recommended_action ?? "REVIEW"}`,
                ],
                [
                  t("rows.reason"),
                  unit.reason ?? t("rows.defaultReason"),
                ],
                [
                  t("rows.replacement"),
                  unit.supplier
                    ? `${unit.supplier.name} · ${formatIdr(unit.supplier.quote_price)}`
                    : tCommon("unavailable"),
                ],
              ]}
            />
          ) : (
            <p className="text-muted-text">{t("recordMissing")}</p>
          )}
        </DialogShell>
      ) : dialog?.kind === "policy-preview" ? (
        <DialogShell title={t("policyPreview.title")}>
          <DataTable
            headers={[
              t("policyPreview.bucket"),
              t("policyPreview.currentGram"),
              t("policyPreview.previewGram"),
            ]}
            rows={(["sell", "route", "hold"] as const).map((key) => [
              key.toUpperCase(),
              formatNumber(dialog.current[key]),
              formatNumber(dialog.next[key]),
            ])}
          />
          <p className="m-0 text-[0.95rem] leading-normal text-muted-text">
            {t("policyPreview.footer")}
          </p>
        </DialogShell>
      ) : dialog?.kind === "action-alert" ? (
        <DialogShell
          title={
            actionAlert?.channel && actionAlert.gram != null
              ? t("actionAlert.title", {
                  action: actionAlert.action,
                  channel: actionAlert.channel,
                  gram: actionAlert.gram,
                })
              : t("actionAlert.fallbackTitle")
          }
          description={
            actionAlert
              ? tActions(`reasons.${actionAlert.reasonKey}`)
              : undefined
          }
        >
          {actionAlert?.supplier ? (
            <>
              <Evidence
                rows={[
                  [
                    t("actionAlert.eligibleInventory"),
                    t("actionAlert.eligibleValue", {
                      pcs: formatNumber(actionAlert.quantity),
                      grams: formatNumber(actionAlert.grams),
                    }),
                  ],
                  [
                    t("actionAlert.supplierQuote"),
                    t("actionAlert.supplierQuoteValue", {
                      name: actionAlert.supplier.name,
                      price: formatIdr(actionAlert.supplier.quotePrice),
                    }),
                  ],
                  [
                    t("actionAlert.capacityLead"),
                    t("actionAlert.capacityLeadValue", {
                      capacity: formatNumber(actionAlert.supplier.capacity),
                      hours: actionAlert.supplier.leadTime,
                    }),
                  ],
                  [
                    t("rows.decisionAction"),
                    t("actionAlert.watchAction"),
                  ],
                ]}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => {
                    setActionStatus(actionAlert.id, "WATCHED");
                    setDialog(null);
                    showToast(tActions("toastWatched"));
                  }}
                >
                  {tActions("markWatched")}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-text">{t("recordMissing")}</p>
          )}
        </DialogShell>
      ) : dialog?.kind === "ready-inventory" ||
        dialog?.kind === "bucket-evidence" ? (
        <DialogShell
          title={
            bucket
              ? t(`bucketTitles.${bucket}`)
              : t("readyTitle")
          }
          description={t("sharedDescription")}
        >
          <Evidence
            rows={[
              [
                t("rows.readyInventory"),
                `${formatNumber(home.grams)}g · ${formatNumber(home.pcs)} pcs`,
              ],
              [
                t("rows.sellReady"),
                `${formatNumber(home.buckets.sell.grams)}g`,
              ],
              [
                t("rows.routeEligible"),
                `${formatNumber(home.buckets.route.grams)}g`,
              ],
              [
                t("rows.hold"),
                `${formatNumber(home.buckets.hold.grams)}g`,
              ],
              [t("rows.prognosaEstimate"), compactRupiah(profit.prognosa)],
              [
                t("rows.investmentEstimate"),
                compactRupiah(profit.investment),
              ],
              [
                t("rows.arbitrageEstimate"),
                compactRupiah(profit.arbitrage),
              ],
              [t("rows.totalProfitHpp"), compactRupiah(profit.total)],
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/inventory" />}
              onClick={() => setDialog(null)}
            >
              {t("viewInventory")}
            </Button>
          </div>
        </DialogShell>
      ) : null}
    </Dialog>
  );
}
