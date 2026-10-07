import type { Gram } from "@/domain/primitives";

export interface SupplierQuoteRow {
  quote_id: string;
  name: string;
  active: boolean;
  gram: Gram;
  quote_price: number | null;
  capacity: number;
  lead_time: number;
  quote_time: string;
  lock_available: boolean;
  lock_status: string;
}
