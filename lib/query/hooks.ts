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
import { fetchUserInfo } from "@/lib/api/auth";
import { fetchInventories } from "@/lib/api/inventories";
import {
  fetchPolicyDraft,
  persistPolicyDraft,
  type PolicyPersistSection,
} from "@/lib/api/policies";
import { fetchPricingPricelistSources } from "@/lib/api/pricelists";
import { fetchSuppliers } from "@/lib/api/suppliers";
import { buildActionAlerts } from "@/lib/actions/build-alerts";
import { buildHomeIntelligence } from "@/lib/intelligence/build-home";
import { buildPricingRows } from "@/lib/pricing/build-rows";
import { fetchAntamQuote, fetchXauQuote } from "@/lib/query/bootstrap";
import { INVENTORY_REFETCH_MS } from "@/lib/query/inventory-refresh";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/stores/use-auth-store";
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

export function useUserInfo() {
  const status = useAuthStore((state) => state.status);

  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: fetchUserInfo,
    staleTime: 60 * 1000,
    refetchInterval: false,
    enabled: status === "authenticated",
  });
}

export function useSettings(display: DisplaySettings) {
  const status = useAuthStore((state) => state.status);
  const permissions = useAuthStore((state) => state.permissions);

  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => fetchPolicyDraft(display, permissions),
    staleTime: 60 * 1000,
    refetchInterval: false,
    enabled: status === "authenticated",
  });
}

function useSettingsRefreshIntervalMs(): number {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const settingsQuery = useSettings({ theme, language });
  const refreshSeconds =
    settingsQuery.data?.system.refreshSeconds ?? DEFAULT_REFRESH_SECONDS;
  return Math.max(MIN_REFRESH_SECONDS, refreshSeconds) * 1000;
}

export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      draft,
      sections,
    }: {
      draft: PolicyDraft;
      sections?: readonly PolicyPersistSection[];
    }) => persistPolicyDraft(draft, sections),
    onSuccess: (_result, { draft }) => {
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
  const status = useAuthStore((state) => state.status);
  const refetchIntervalMs = useSettingsRefreshIntervalMs();

  return useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: fetchSuppliers,
    staleTime: refetchIntervalMs,
    refetchInterval: refetchIntervalMs,
    enabled: (options?.enabled ?? true) && status === "authenticated",
  });
}

export function useMarketAntam() {
  const status = useAuthStore((state) => state.status);
  const refetchIntervalMs = useSettingsRefreshIntervalMs();

  return useQuery<AntamQuote>({
    queryKey: queryKeys.market.antam,
    queryFn: fetchAntamQuote,
    staleTime: refetchIntervalMs,
    refetchInterval: refetchIntervalMs,
    enabled: status === "authenticated",
  });
}

export function useInventoryRecords(options?: { enabled?: boolean }) {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const settingsQuery = useSettings({ theme, language });
  const suppliersQuery = useSuppliers();
  const antamQuery = useMarketAntam();
  const status = useAuthStore((state) => state.status);
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchInventories,
    staleTime: INVENTORY_REFETCH_MS,
    refetchInterval: (query) =>
      query.state.fetchStatus === "fetching" ? false : INVENTORY_REFETCH_MS,
    enabled: (options?.enabled ?? true) && status === "authenticated",
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

export function useMarketXau(options?: { enabled?: boolean }) {
  const status = useAuthStore((state) => state.status);
  const refetchIntervalMs = useSettingsRefreshIntervalMs();

  return useQuery<XauQuote>({
    queryKey: queryKeys.market.xau,
    queryFn: fetchXauQuote,
    staleTime: refetchIntervalMs,
    refetchInterval: refetchIntervalMs,
    enabled: (options?.enabled ?? true) && status === "authenticated",
  });
}

export function usePricing(_filters?: PricingFilters) {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const settingsQuery = useSettings({ theme, language });
  const inventoryQuery = useInventoryRecords();
  const suppliersQuery = useSuppliers();
  const refetchIntervalMs = useSettingsRefreshIntervalMs();
  const status = useAuthStore((state) => state.status);
  const pricelistsQuery = useQuery({
    queryKey: queryKeys.pricing.all,
    queryFn: fetchPricingPricelistSources,
    staleTime: refetchIntervalMs,
    refetchInterval: refetchIntervalMs,
    enabled: status === "authenticated",
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
