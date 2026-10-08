import type { Gram } from "@/domain/primitives";

export interface SupplierQuoteRow {
  quoteId: string;
  name: string;
  active: boolean;
  gram: Gram;
  quotePrice: number | null;
  capacity: number;
  leadTime: number;
  quoteTime: string;
  validUntil: string;
  lockAvailable: boolean;
  lockStatus: string;
}
