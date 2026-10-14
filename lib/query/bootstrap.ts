import type { QueryClient } from "@tanstack/react-query";
import { PERMISSION, hasPermission } from "@/domain/auth";
import type { AntamQuote, XauQuote } from "@/domain/market";
import type { DisplaySettings } from "@/domain/settings";
import { fetchInventories } from "@/lib/api/inventories";
import { fetchPolicyDraft } from "@/lib/api/policies";
import {
  type AntamPricelistSnapshot,
  antamBuybackChangePercent,
  antamBuybackPerGram,
  antamSellChangePercent,
  fetchAntamPricelistSnapshots,
  fetchGmiClubPricelists,
  fetchXauPricelists,
  percentChange,
  pickAntamSnapshot,
} from "@/lib/api/pricelists";
import { fetchSuppliers } from "@/lib/api/suppliers";
import { queryKeys } from "@/lib/query/keys";

export function toAntamQuote(snapshots: AntamPricelistSnapshot[]): AntamQuote {
  const current = pickAntamSnapshot(snapshots, "CURRENT");
  const previous = pickAntamSnapshot(snapshots, "PREVIOUS");
  const currentPrices = current?.prices ?? [];

  const sell: AntamQuote["sell"] = {};
  for (const row of currentPrices) {
    sell[row.gram] = row.sellPrice;
  }

  return {
    sell,
    buyback: antamBuybackPerGram(currentPrices),
    sell1gChange:
      previous != null
        ? antamSellChangePercent(currentPrices, previous.prices, 1)
        : null,
    buybackChange:
      previous != null
        ? antamBuybackChangePercent(currentPrices, previous.prices)
        : null,
  };
}

export async function fetchXauQuote(): Promise<XauQuote> {
  const rows = await fetchXauPricelists();
  const byType = {
    CURRENT: rows.find((row) => row.type === "CURRENT"),
    PREVIOUS: rows.find((row) => row.type === "PREVIOUS"),
  };

  if (byType.CURRENT != null) {
    const previous = byType.PREVIOUS?.price;
    const change =
      previous != null ? percentChange(byType.CURRENT.price, previous) : null;
    return { current: byType.CURRENT.price, change };
  }

  const sorted = [...rows].sort(
    (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
  );
  const latest = sorted[0];
  if (latest == null) {
    throw new Error("No XAU prices available");
  }

  const previous = sorted[1]?.price;
  const change =
    previous != null ? percentChange(latest.price, previous) : null;

  return { current: latest.price, change };
}

export async function bootstrapAppData(
  queryClient: QueryClient,
  display: DisplaySettings,
  permissions: readonly string[] = [],
): Promise<void> {
  const tasks: Promise<unknown>[] = [
    queryClient.prefetchQuery({
      queryKey: queryKeys.settings,
      queryFn: () => fetchPolicyDraft(display, permissions),
      staleTime: 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.market.antam,
      queryFn: fetchAntamPricelistSnapshots,
      staleTime: 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.market.xau,
      queryFn: fetchXauQuote,
      staleTime: 60 * 1000,
    }),
  ];

  if (hasPermission(permissions, PERMISSION.VIEW_INVENTORY)) {
    tasks.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.inventory.all,
        queryFn: fetchInventories,
        staleTime: 60 * 1000,
      }),
    );
  }

  if (hasPermission(permissions, PERMISSION.VIEW_SUPPLIER)) {
    tasks.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.suppliers,
        queryFn: fetchSuppliers,
        staleTime: 60 * 1000,
      }),
    );
  }

  if (hasPermission(permissions, PERMISSION.VIEW_PRICELIST)) {
    tasks.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.pricing.all,
        queryFn: fetchGmiClubPricelists,
        staleTime: 60 * 1000,
      }),
    );
  }

  await Promise.all(tasks);
}
