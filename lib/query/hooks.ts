"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classifyInventory } from "@/domain/decision";
import type { InventoryFilters, PricingFilters } from "@/domain/filters";
import type { InventoryRecord } from "@/domain/inventory";
import { enrichInventoryEconomics } from "@/domain/inventory-economics";
import type { AntamQuote, XauQuote } from "@/domain/market";
import type { DecisionBucket, Segment } from "@/domain/primitives";
import {
  DEFAULT_REFRESH_SECONDS,
  MIN_REFRESH_SECONDS,
  type DisplaySettings,
  type PolicyDraft,
} from "@/domain/settings";
import { fetchInventories } from "@/lib/api/inventories";
import { fetchPolicyDraft, persistPolicyDraft } from "@/lib/api/policies";
import {
  fetchAntamPricelists,
  fetchPricingPricelistSources,
} from "@/lib/api/pricelists";
import { fetchSuppliers } from "@/lib/api/suppliers";
import { buildActionAlerts } from "@/lib/actions/build-alerts";
import { buildHomeIntelligence } from "@/lib/intelligence/build-home";
import { buildPricingRows } from "@/lib/pricing/build-rows";
import { queryKeys } from "@/lib/query/keys";
import { useSettingsStore } from "@/stores/use-settings-store";

class ApiNotImplementedError extends Error {
  constructor(readonly endpoint: string) {
    super(`API client is not implemented yet: ${endpoint}`);
    this.name = "ApiNotImplementedError";
  }
}

function notImplemented(endpoint: string): Promise<never> {
  return Promise.reject(new ApiNotImplementedError(endpoint));
}

export function useSettings(display: DisplaySettings) {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => fetchPolicyDraft(display),
    staleTime: 60 * 1000,
    refetchInterval: false,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: PolicyDraft) => persistPolicyDraft(draft),
    onSuccess: (_result, draft) => {
      queryClient.setQueryData<PolicyDraft>(queryKeys.settings, draft);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.intelligence.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.suppliers,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.pricing.all,
      });
    },
  });
}

export function useIntelligenceEvidence(
  bucket: DecisionBucket,
  segment: Segment,
) {
  return useQuery({
    queryKey: queryKeys.intelligence.evidence(bucket, segment),
    queryFn: () =>
      notImplemented(`GET /api/intelligence/evidence/${bucket}`),
    enabled: false,
    refetchInterval: false,
  });
}

export function useSuppliers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: fetchSuppliers,
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export function useMarketAntam() {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const settingsQuery = useSettings({ theme, language });
  const refreshSeconds =
    settingsQuery.data?.system.refreshSeconds ?? DEFAULT_REFRESH_SECONDS;
  const refetchIntervalMs =
    Math.max(MIN_REFRESH_SECONDS, refreshSeconds) * 1000;

  return useQuery<AntamQuote>({
    queryKey: queryKeys.market.antam,
    queryFn: async () => {
      const rows = await fetchAntamPricelists();
      const sell: AntamQuote["sell"] = {};
      for (const row of rows) {
        sell[row.gram] = row.sellPrice;
      }
      return { sell, buyback: null };
    },
    staleTime: Math.min(30 * 1000, refetchIntervalMs),
    refetchInterval: refetchIntervalMs,
  });
}

/** Fetches full `GET /inventories` list. Filters are applied client-side. */
export function useInventoryRecords(options?: { enabled?: boolean }) {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const settingsQuery = useSettings({ theme, language });
  const suppliersQuery = useSuppliers();
  const antamQuery = useMarketAntam();
  const refreshSeconds =
    settingsQuery.data?.system.refreshSeconds ?? DEFAULT_REFRESH_SECONDS;
  const refetchIntervalMs =
    Math.max(MIN_REFRESH_SECONDS, refreshSeconds) * 1000;
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchInventories,
    staleTime: Math.min(30 * 1000, refetchIntervalMs),
    refetchInterval: refetchIntervalMs,
    enabled: options?.enabled ?? true,
  });

  const data = useMemo((): InventoryRecord[] | undefined => {
    if (!inventoryQuery.data) return undefined;

    const withEconomics = enrichInventoryEconomics(
      inventoryQuery.data,
      antamQuery.data?.sell ?? {},
    );

    if (!settingsQuery.data) return withEconomics;

    return classifyInventory(withEconomics, {
      policy: settingsQuery.data,
      suppliers: suppliersQuery.data ?? [],
    });
  }, [
    inventoryQuery.data,
    settingsQuery.data,
    suppliersQuery.data,
    antamQuery.data?.sell,
  ]);

  return {
    ...inventoryQuery,
    data,
    isPending:
      inventoryQuery.isPending ||
      settingsQuery.isPending ||
      antamQuery.isPending,
    isFetching:
      inventoryQuery.isFetching ||
      settingsQuery.isFetching ||
      antamQuery.isFetching,
  };
}

export function useIntelligence(segment: Segment) {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const settingsQuery = useSettings({ theme, language });
  const inventoryQuery = useInventoryRecords();

  const data = useMemo(() => {
    if (!inventoryQuery.data) return undefined;
    return buildHomeIntelligence({
      inventory: inventoryQuery.data,
      policy: settingsQuery.data,
      segment,
    });
  }, [inventoryQuery.data, settingsQuery.data, segment]);

  return {
    ...inventoryQuery,
    data,
    dataUpdatedAt: inventoryQuery.dataUpdatedAt,
    isPending: inventoryQuery.isPending || settingsQuery.isPending,
    isFetching: inventoryQuery.isFetching || settingsQuery.isFetching,
    isError: inventoryQuery.isError,
    error: inventoryQuery.error,
  };
}

export function useInventory(_filters?: InventoryFilters) {
  return useInventoryRecords();
}

export function useMarketXau() {
  return useQuery<XauQuote>({
    queryKey: queryKeys.market.xau,
    queryFn: () => notImplemented("GET /api/market/xau"),
    enabled: false,
  });
}

export function usePricing(_filters?: PricingFilters) {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const settingsQuery = useSettings({ theme, language });
  const inventoryQuery = useInventoryRecords();
  const suppliersQuery = useSuppliers();
  const pricelistsQuery = useQuery({
    queryKey: queryKeys.pricing.all,
    queryFn: fetchPricingPricelistSources,
    staleTime: 60 * 1000,
  });

  const data = useMemo(() => {
    if (!pricelistsQuery.data) return undefined;
    return buildPricingRows({
      pricelists: pricelistsQuery.data.gmiclub,
      antam: pricelistsQuery.data.antam,
      inventory: inventoryQuery.data ?? [],
      margin: settingsQuery.data?.margin,
      suppliers: suppliersQuery.data ?? [],
    });
  }, [
    pricelistsQuery.data,
    inventoryQuery.data,
    settingsQuery.data?.margin,
    suppliersQuery.data,
  ]);

  return {
    ...pricelistsQuery,
    data,
    isPending:
      pricelistsQuery.isPending ||
      settingsQuery.isPending ||
      inventoryQuery.isPending,
    isFetching:
      pricelistsQuery.isFetching ||
      settingsQuery.isFetching ||
      inventoryQuery.isFetching,
    isError: pricelistsQuery.isError,
    error: pricelistsQuery.error,
  };
}

export function useActions(options?: { enabled?: boolean }) {
  const inventoryQuery = useInventoryRecords({
    enabled: options?.enabled ?? true,
  });
  const suppliersQuery = useSuppliers({
    enabled: options?.enabled ?? true,
  });

  const data = useMemo(() => {
    if (!inventoryQuery.data) return undefined;
    return buildActionAlerts({
      inventory: inventoryQuery.data,
      suppliers: suppliersQuery.data ?? [],
    });
  }, [inventoryQuery.data, suppliersQuery.data]);

  return {
    ...inventoryQuery,
    data,
    isPending: inventoryQuery.isPending || suppliersQuery.isPending,
    isFetching: inventoryQuery.isFetching || suppliersQuery.isFetching,
    isError: inventoryQuery.isError || suppliersQuery.isError,
    error: inventoryQuery.error ?? suppliersQuery.error,
  };
}
