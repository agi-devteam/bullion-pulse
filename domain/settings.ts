import type { Channel, Gram, Language, Theme } from "@/domain/primitives";

export type MarginByGram = Record<Gram, number>;

export interface MarginPolicy {
  minimumMargin: Record<Channel, MarginByGram>;
}

export interface RoutePolicy {
  minimumMargin: number;
  maxLeadHours: number;
  capacityRequired: boolean;
}

export interface SupplierPolicyQuote {
  quoteId: string;
  supplierId: string;
  name: string;
  gram: Gram;
  active: boolean;
  capacity: number;
  leadTime: number;
}

export interface SupplierPolicy {
  quotes: SupplierPolicyQuote[];
}

export interface SystemSettings {
  businessDayStart: string;
  refreshSeconds: number;
  staleMinutes: number;
  antamSource: string;
  xauEnabled: boolean;
}

export interface DisplaySettings {
  theme: Theme;
  language: Language;
}

export interface PolicyDraft {
  margin: MarginPolicy;
  route: RoutePolicy;
  supplier: SupplierPolicy;
  system: SystemSettings;
  display: DisplaySettings;
}

export const SETTINGS_TABS = [
  "dashboard",
  "margin",
  "route",
  "supplier",
  "system",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];
