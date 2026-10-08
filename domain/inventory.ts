import type { BucketProfit } from "@/domain/intelligence";
import type { Channel, Gram, InventoryDecision } from "@/domain/primitives";

export interface InventorySupplierRef {
  name: string;
  quotePrice: number;
}

export interface InventoryRecord {
  stockId: string;
  serial: string;
  gram: Gram;
  channel: Channel;
  availabilityStatus: string;
  reserved: boolean;
  unitCost: number;
  purchasePrice: number;
  sellingPrice: number | null;
  directGp: number | null;
  directMargin: number | null;
  decision: InventoryDecision | null;
  recommendedAction: string | null;
  production: string;
  stockKeeper: string;
  marketAtPurchase: number | null;
  marketAtSale: number | null;
  profit: BucketProfit;
  reason: string | null;
  supplier: InventorySupplierRef | null;
  policyMargin: number | null;
  valid: boolean;
  ready: boolean;
}

export interface InventorySummary {
  readyGrams: number;
  readyPcs: number;
  invalidPcs: number;
  unpricedPcs: number;
}
