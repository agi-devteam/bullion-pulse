import type { Channel, InventoryDecision } from "@/domain/primitives";

export type InventoryAvailabilityFilter = "READY" | "ALL" | "INVALID";

export interface InventoryFilters {
  channel: "all" | Channel;
  status: InventoryAvailabilityFilter;
  decision: "all" | InventoryDecision;
  search: string;
  page: number;
  pageSize: number;
}

export interface PricingFilters {
  channel: "all" | Channel;
  gram: "all" | `${number}`;
}
