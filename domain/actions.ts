import type { Channel, Gram } from "@/domain/primitives";

export type ActionType = "WATCH";
export type ActionSeverity = "attention" | "risk";
export type ActionStatus = "OPEN" | "WATCHED";
export type ActionReasonKey = "watch10" | "watch25";

export interface ActionAlertSupplier {
  name: string;
  quotePrice: number;
  capacity: number;
  leadTime: number;
}

export interface ActionAlert {
  id: string;
  severity: ActionSeverity;
  action: ActionType;
  channel: Channel;
  gram: Gram;
  quantity: number;
  grams: number;
  reasonKey: ActionReasonKey;
  status: ActionStatus;
  createdAt: string;
  supplier: ActionAlertSupplier | null;
}
