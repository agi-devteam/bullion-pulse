"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryFilters, PricingFilters } from "@/domain/filters";
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
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import {
  getActionAlerts,
  getPricingRows,
  getSupplierQuotes,
} from "@/lib/mocks/workspace";
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
    },
  });
}

export function useIntelligence(segment: Segment) {
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const settingsQuery = useSettings({ theme, language });
  const refreshSeconds =
    settingsQuery.data?.system.refreshSeconds ?? DEFAULT_REFRESH_SECONDS;
  const refetchIntervalMs =
    Math.max(MIN_REFRESH_SECONDS, refreshSeconds) * 1000;

  return useQuery({
    queryKey: queryKeys.intelligence.bySegment(segment),
    queryFn: () => Promise.resolve(getHomeIntelligence(segment)),
    staleTime: Math.min(30 * 1000, refetchIntervalMs),
    refetchInterval: refetchIntervalMs,
    placeholderData: (previous) => previous,
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

/** Fetches full `GET /inventories` list. Filters are applied client-side. */
export function useInventoryRecords(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchInventories,
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export function useInventory(_filters?: InventoryFilters) {
  return useInventoryRecords();
}

export function useMarketAntam() {
  return useQuery<AntamQuote>({
    queryKey: queryKeys.market.antam,
    queryFn: () => notImplemented("GET /api/market/antam"),
    enabled: false,
  });
}

export function useMarketXau() {
  return useQuery<XauQuote>({
    queryKey: queryKeys.market.xau,
    queryFn: () => notImplemented("GET /api/market/xau"),
    enabled: false,
  });
}

/** Full pricing list. Filters are applied client-side. */
export function usePricing(_filters?: PricingFilters) {
  return useQuery({
    queryKey: queryKeys.pricing.all,
    queryFn: () => Promise.resolve(getPricingRows()),
    staleTime: 60 * 1000,
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: () => Promise.resolve(getSupplierQuotes()),
    staleTime: 60 * 1000,
  });
}

export function useActions() {
  return useQuery({
    queryKey: queryKeys.actions,
    queryFn: () => Promise.resolve(getActionAlerts()),
    staleTime: 60 * 1000,
  });
}
