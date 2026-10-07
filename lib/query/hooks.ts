"use client";

import { useQuery } from "@tanstack/react-query";
import type { DecisionBucket, Segment } from "@/domain/primitives";
import type { InventoryFilters, PricingFilters } from "@/domain/filters";
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
    queryFn: () => notImplemented("GET /api/intelligence"),
    enabled: false,
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

export function useInventory(filters: InventoryFilters) {
  return useQuery({
    queryKey: queryKeys.inventory.list(filters),
    queryFn: () => notImplemented("GET /api/inventory"),
    enabled: false,
  });
}

export function useMarketAntam() {
  return useQuery({
    queryKey: queryKeys.market.antam,
    queryFn: () => notImplemented("GET /api/market/antam"),
    enabled: false,
  });
}

export function useMarketXau() {
  return useQuery({
    queryKey: queryKeys.market.xau,
    queryFn: () => notImplemented("GET /api/market/xau"),
    enabled: false,
  });
}

export function usePricing(filters: PricingFilters) {
  return useQuery({
    queryKey: queryKeys.pricing.list(filters),
    queryFn: () => notImplemented("GET /api/pricing"),
    enabled: false,
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: () => notImplemented("GET /api/suppliers"),
    enabled: false,
  });
}

export function useActions() {
  return useQuery({
    queryKey: queryKeys.actions,
    queryFn: () => notImplemented("GET /api/actions"),
    enabled: false,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => notImplemented("GET /api/settings"),
    enabled: false,
    staleTime: Infinity,
    refetchInterval: false,
  });
}
