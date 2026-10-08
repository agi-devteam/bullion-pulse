import type { QueryClient } from "@tanstack/react-query";
import type { AntamQuote } from "@/domain/market";
import type { DisplaySettings } from "@/domain/settings";
import { fetchInventories } from "@/lib/api/inventories";
import { fetchPolicyDraft } from "@/lib/api/policies";
import {
  fetchAntamPricelists,
  fetchPricingPricelistSources,
} from "@/lib/api/pricelists";
import { fetchSuppliers } from "@/lib/api/suppliers";
import { INVENTORY_REFETCH_MS } from "@/lib/query/inventory-refresh";
import { queryKeys } from "@/lib/query/keys";

export async function fetchAntamQuote(): Promise<AntamQuote> {
  const rows = await fetchAntamPricelists();
  const sell: AntamQuote["sell"] = {};
  for (const row of rows) {
    sell[row.gram] = row.sellPrice;
  }
  return { sell, buyback: null };
}

export async function bootstrapAppData(
  queryClient: QueryClient,
  display: DisplaySettings,
): Promise<void> {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.settings,
      queryFn: () => fetchPolicyDraft(display),
      staleTime: 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.inventory.all,
      queryFn: fetchInventories,
      staleTime: INVENTORY_REFETCH_MS,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.market.antam,
      queryFn: fetchAntamQuote,
      staleTime: 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.suppliers,
      queryFn: fetchSuppliers,
      staleTime: 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.pricing.all,
      queryFn: fetchPricingPricelistSources,
      staleTime: 60 * 1000,
    }),
  ]);
}
