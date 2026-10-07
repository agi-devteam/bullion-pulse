import type { BucketProfit } from "@/domain/intelligence";
import type { Channel, Gram, InventoryDecision } from "@/domain/primitives";

export interface InventorySupplierRef {
  name: string;
  quote_price: number;
}

export interface InventoryRecord {
  stock_id: string;
  serial: string;
  gram: Gram;
  channel: Channel;
  availability_status: string;
  reserved: boolean;
  unit_cost: number;
  purchase_price: number;
  selling_price: number | null;
  direct_gp: number | null;
  direct_margin: number | null;
  decision: InventoryDecision | null;
  recommended_action: string | null;
  production: string;
  stock_keeper: string;
  market_at_purchase: number | null;
  market_at_sale: number | null;
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
  excludedPcs: number;
  invalidPcs: number;
  unpricedPcs: number;
}
