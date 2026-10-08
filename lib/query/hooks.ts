"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryFilters, PricingFilters } from "@/domain/filters";
import type { AntamQuote, XauQuote } from "@/domain/market";
import type { DecisionBucket, Segment } from "@/domain/primitives";
import type { DisplaySettings, PolicyDraft } from "@/domain/settings";
import { fetchInventories } from "@/lib/api/inventories";
import { fetchPolicyDraft, persistPolicyDraft } from "@/lib/api/policies";
import { getHomeIntelligence } from "@/lib/mocks/home-intelligence";
import {
  getActionAlerts,
  getPricingRows,
  getSupplierQuotes,
} from "@/lib/mocks/workspace";
import { queryKeys } from "@/lib/query/keys";

class ApiNotImplementedError extends Error {
  constructor(readonly endpoint: string) {
    super(`API client is not implemented yet: ${endpoint}`);
    this.name = "ApiNotImplementedError";
  }
}

function notImplemented(endpoint: string): Promise<never> {
  return Promise.reject(new ApiNotImplementedError(endpoint));
}

export function useIntelligence(segment: Segment) {
  return useQuery({
    queryKey: queryKeys.intelligence.bySegment(segment),
    queryFn: () => Promise.resolve(getHomeIntelligence(segment)),
    staleTime: 60 * 1000,
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
    },
  });
}
