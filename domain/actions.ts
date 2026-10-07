import type { Channel, Gram } from "@/domain/primitives";

export type ActionType = "WATCH" | "REPRICE" | "REVIEW DATA";
export type ActionSeverity = "attention" | "risk";

export interface ActionAlert {
  id: string;
  severity: ActionSeverity;
  action: ActionType;
  channel: Channel | null;
  gram: Gram | null;
  quantity: number;
  reason: string;
  owner: string;
  status: "OPEN" | "REVIEWED";
  href: string;
}
