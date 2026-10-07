import type { DecisionBucket } from "@/domain/primitives";

export type DialogPayload =
  | { kind: "ready-inventory" }
  | { kind: "bucket-evidence"; bucket: DecisionBucket }
  | { kind: "inventory-unit"; stockId: string; serial?: string }
  | { kind: "policy-preview" };
