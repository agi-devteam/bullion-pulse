"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/button";
import { Evidence } from "@/components/molecules/evidence";
import { DataTable } from "@/components/organisms/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/organisms/dialog";
import type { BucketProfit } from "@/domain/intelligence";
import { findInventoryRecord } from "@/lib/api/inventories";
import { formatIdr, formatNumber, formatPercent } from "@/lib/format/money";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import { getActionAlerts } from "@/lib/mocks/workspace";
import { useInventoryRecords } from "@/lib/query/hooks";
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

function ProfitEvidence({
  profit,
  marketAvgAtPurchase,
  marketAvgNow,
}: {
  profit: BucketProfit;
  marketAvgAtPurchase: number;
  marketAvgNow: number;
}) {
  const t = useTranslations("evidence");

  return (
    <div className="flex flex-col gap-3.5">
      <h3 className="m-0 text-[1.05rem] font-semibold">{t("profitTitle")}</h3>
      <p className="m-0 text-[0.95rem] leading-normal text-muted-text">
        {t("profitIntro", {
          purchase: formatIdr(marketAvgAtPurchase),
          current: formatIdr(marketAvgNow),
        })}
      </p>
      <DataTable
        headers={[
          t("profitTable.component"),
          t("profitTable.formula"),
          t("profitTable.total"),
        ]}
        rows={[
          [
            t("profitTable.prognosa"),
            t("profitTable.prognosaFormula"),
            <span key="prognosa" className="font-mono">
              {formatIdr(profit.prognosa)}
            </span>,
          ],
          [
            t("profitTable.investment"),
            t("profitTable.investmentFormula"),
            <span key="investment" className="font-mono">
              {formatIdr(profit.investment)}
            </span>,
          ],
          [
            t("profitTable.arbitrage"),
            t("profitTable.arbitrageFormula"),
            <span key="arbitrage" className="font-mono">
              {formatIdr(profit.arbitrage)}
            </span>,
          ],
          [
            t("profitTable.totalProfit"),
            t("profitTable.totalFormula"),
            <span key="total" className="font-mono">
              {formatIdr(profit.total)}
            </span>,
          ],
        ]}
      />
      <p className="m-0 text-[0.95rem] leading-normal text-muted-text">
        {t("profitFooter")}
      </p>
    </div>
  );
}

export function EvidenceDialog() {
  const dialog = useUIStore((state) => state.dialog);
  const setDialog = useUIStore((state) => state.setDialog);
  const setActionStatus = useUIStore((state) => state.setActionStatus);
  const showToast = useUIStore((state) => state.showToast);
  const segment = useSettingsStore((state) => state.segment);
  const t = useTranslations("evidence");
  const tInventory = useTranslations("inventory");
  const tActions = useTranslations("actions");
  const tCommon = useTranslations("common");
  const home = getHomeIntelligence(segment);
  const open = dialog != null;
  const bucket = dialog?.kind === "bucket-evidence" ? dialog.bucket : null;
  const profit = bucket ? home.buckets[bucket].profit : home.profit;
  const inventoryQuery = useInventoryRecords({
    enabled: dialog?.kind === "inventory-unit",
  });
  const unit =
    dialog?.kind === "inventory-unit"
      ? findInventoryRecord(inventoryQuery.data, dialog.stockId)
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
        >
          {unit ? (
            <Evidence
              rows={[
                [t("rows.stockId"), unit.stockId],
                [
                  t("rows.channelGram"),
                  `${unit.channel} · ${unit.gram}g`,
                ],
                [
                  t("rows.productionKeeper"),
                  `${unit.production || tCommon("emDash")} · ${unit.stockKeeper}`,
                ],
                [t("rows.availability"), unit.availabilityStatus],
                [
                  t("rows.hppUnit"),
                  formatIdr(unit.unitCost > 0 ? unit.unitCost : null),
                ],
                [
                  t("rows.purchasePriceUnit"),
                  formatIdr(
                    unit.purchasePrice > 0 ? unit.purchasePrice : null,
                  ),
                ],
                [t("rows.sellingPrice"), formatIdr(unit.sellingPrice)],
                [
                  t("rows.totalGpMargin"),
                  unit.directGp != null && unit.directMargin != null
                    ? `${formatIdr(unit.directGp)} / ${formatPercent(unit.directMargin)}`
                    : tCommon("emDash"),
                ],
                [
                  t("rows.marketAtPurchase"),
                  formatIdr(unit.marketAtPurchase),
                ],
                [t("rows.marketNowAntam"), formatIdr(unit.marketAtSale)],
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
                  `${unit.decision ?? tCommon("decisions.excludedUnpriced")} · ${unit.recommendedAction ?? "REVIEW"}`,
                ],
                [
                  t("rows.reason"),
                  unit.reason ?? t("rows.defaultReason"),
                ],
                [
                  t("rows.replacement"),
                  unit.supplier
                    ? `${unit.supplier.name} · ${formatIdr(unit.supplier.quotePrice)}`
                    : tCommon("unavailable"),
                ],
              ]}
            />
          ) : inventoryQuery.isFetching ? (
            <p className="text-muted-text">{tInventory("loading")}</p>
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
                    t("actionAlert.action"),
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
          description={t("formulaDescription")}
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
              [
                t("rows.excludedInvalid"),
                t("rows.excludedInvalidValue", {
                  excluded: formatNumber(home.excludedPcs),
                  invalid: formatNumber(home.invalidCount),
                }),
              ],
              [
                t("rows.readyWithoutSource"),
                t("rows.readyWithoutSourceValue", {
                  count: formatNumber(home.unpricedPcs),
                }),
              ],
            ]}
          />
          {bucket ? (
            <DataTable
              headers={[
                t("bucketTable.channel"),
                t("bucketTable.gram"),
                t("bucketTable.qty"),
                t("bucketTable.reason"),
              ]}
              rows={home.buckets[bucket].evidenceRows.map((row) => [
                row.channel,
                `${row.gram}g`,
                t("bucketTable.qtyValue", {
                  count: formatNumber(row.qty),
                }),
                row.reason,
              ])}
            />
          ) : null}
          <ProfitEvidence
            profit={profit}
            marketAvgAtPurchase={home.marketAvgAtPurchase}
            marketAvgNow={home.marketAvgNow}
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
