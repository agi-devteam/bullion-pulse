import { PERMISSION, hasPermission } from "@/domain/auth";
import type { Channel, Gram } from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import type {
  DisplaySettings,
  MarginPolicy,
  PolicyDraft,
  RoutePolicy,
  SupplierPolicy,
  SupplierPolicyQuote,
  SystemSettings,
} from "@/domain/settings";
import { apiGet, apiPut } from "@/lib/api/http";
import { createDefaultPolicyDraft } from "@/lib/settings/defaults";

/** Live backend shapes — match Express /policies/* contracts. */

export interface MarginPolicyRowDto {
  channel: Channel;
  grammage: number;
  minimumMargin: number;
  updatedAt?: number;
}

export interface RoutePolicyDto {
  minimumMargin: number;
  maxLeadHours: number;
  capacityRequired: boolean;
  updatedAt?: number;
}

export interface SystemPolicyDto {
  businessDayStart: string;
  refreshSeconds: number;
  staleMinutes: number;
  xauEnabled: boolean;
  updatedAt?: number;
}

/** GET /policies/suppliers item — editable policy fields only. */
export interface SupplierPolicyDto {
  supplierId: string;
  quoteId: string;
  name: string;
  active: boolean;
  grammage: number;
  capacity: number;
  leadTime: number;
}

/** PUT /policies/suppliers body item. */
export interface SupplierPolicyPutDto {
  quoteId: string;
  active: boolean;
  capacity: number;
  leadTime: number;
}

export type MarginPolicyPutDto = Omit<MarginPolicyRowDto, "updatedAt">;
export type RoutePolicyPutDto = Omit<RoutePolicyDto, "updatedAt">;
export type SystemPolicyPutDto = Omit<SystemPolicyDto, "updatedAt">;

const ANTAM_SOURCE = "https://www.logammulia.com/";

function isGram(value: number): value is Gram {
  return (GRAMS as readonly number[]).includes(value);
}

function isChannel(value: string): value is Channel {
  return value === "B2C" || value === "B2B";
}

/** Normalize backend `HH:MM:SS` (or `HH:MM`) to HTML `time` input value. */
export function toTimeInputValue(value: string): string {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return value;
  return `${match[1]}:${match[2]}`;
}

/** Normalize UI `HH:MM` to backend `HH:MM:SS`. */
export function toBackendTimeValue(value: string): string {
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  return trimmed;
}

export function marginRowsToPolicy(rows: MarginPolicyRowDto[]): MarginPolicy {
  const defaults = createDefaultPolicyDraft({
    theme: "system",
    language: "id",
  }).margin;
  const minimumMargin = {
    B2C: { ...defaults.minimumMargin.B2C },
    B2B: { ...defaults.minimumMargin.B2B },
  };

  for (const row of rows) {
    if (!isChannel(row.channel) || !isGram(row.grammage)) continue;
    minimumMargin[row.channel][row.grammage] = row.minimumMargin;
  }

  return { minimumMargin };
}

export function marginPolicyToRows(policy: MarginPolicy): MarginPolicyPutDto[] {
  const rows: MarginPolicyPutDto[] = [];
  for (const channel of ["B2C", "B2B"] as const) {
    for (const gram of GRAMS) {
      rows.push({
        channel,
        grammage: gram,
        minimumMargin: policy.minimumMargin[channel][gram],
      });
    }
  }
  return rows;
}

export function routeDtoToPolicy(dto: RoutePolicyDto): RoutePolicy {
  return {
    minimumMargin: dto.minimumMargin,
    maxLeadHours: dto.maxLeadHours,
    capacityRequired: dto.capacityRequired,
  };
}

export function routePolicyToDto(policy: RoutePolicy): RoutePolicyPutDto {
  return {
    minimumMargin: policy.minimumMargin,
    maxLeadHours: policy.maxLeadHours,
    capacityRequired: policy.capacityRequired,
  };
}

export function systemDtoToSettings(dto: SystemPolicyDto): SystemSettings {
  return {
    businessDayStart: toTimeInputValue(dto.businessDayStart),
    refreshSeconds: dto.refreshSeconds,
    staleMinutes: dto.staleMinutes,
    antamSource: ANTAM_SOURCE,
    xauEnabled: dto.xauEnabled,
  };
}

export function systemSettingsToDto(
  settings: SystemSettings,
): SystemPolicyPutDto {
  return {
    businessDayStart: toBackendTimeValue(settings.businessDayStart),
    refreshSeconds: settings.refreshSeconds,
    staleMinutes: settings.staleMinutes,
    xauEnabled: settings.xauEnabled,
  };
}

export function mapSupplierPolicyDto(
  dto: SupplierPolicyDto,
): SupplierPolicyQuote {
  const gram = isGram(dto.grammage) ? dto.grammage : (dto.grammage as Gram);

  return {
    quoteId: String(dto.quoteId ?? ""),
    supplierId: String(dto.supplierId ?? ""),
    name: dto.name ?? "",
    gram,
    active: Boolean(dto.active),
    capacity: Number.isFinite(dto.capacity) ? dto.capacity : 0,
    leadTime: Number.isFinite(dto.leadTime) ? dto.leadTime : 0,
  };
}

export function toSupplierPolicyPut(
  quote: Pick<SupplierPolicyQuote, "quoteId" | "active" | "capacity" | "leadTime">,
): SupplierPolicyPutDto {
  return {
    quoteId: quote.quoteId,
    active: quote.active,
    capacity: quote.capacity,
    leadTime: quote.leadTime,
  };
}

export async function fetchMarginPolicies(): Promise<MarginPolicyRowDto[]> {
  return apiGet<MarginPolicyRowDto[]>("/policies/margins");
}

export async function fetchRoutePolicy(): Promise<RoutePolicyDto> {
  return apiGet<RoutePolicyDto>("/policies/routes");
}

export async function fetchSystemPolicy(): Promise<SystemPolicyDto> {
  return apiGet<SystemPolicyDto>("/policies/systems");
}

export async function fetchSupplierPolicies(): Promise<SupplierPolicyDto[]> {
  return apiGet<SupplierPolicyDto[]>("/policies/suppliers");
}

export async function updateMarginPolicies(
  rows: MarginPolicyPutDto[],
): Promise<void> {
  await apiPut("/policies/margins", rows);
}

export async function updateRoutePolicy(
  body: RoutePolicyPutDto,
): Promise<void> {
  await apiPut("/policies/routes", body);
}

export async function updateSystemPolicy(
  body: SystemPolicyPutDto,
): Promise<void> {
  await apiPut("/policies/systems", body);
}

export async function updateSupplierPolicies(
  rows: SupplierPolicyPutDto[],
): Promise<void> {
  await apiPut("/policies/suppliers", rows);
}

export async function persistSupplierPolicy(
  policy: SupplierPolicy,
): Promise<void> {
  await updateSupplierPolicies(policy.quotes.map(toSupplierPolicyPut));
}

export type PolicyPersistSection = "margin" | "route" | "supplier" | "system";

export async function fetchPolicyDraft(
  display: DisplaySettings,
  permissions?: readonly string[],
): Promise<PolicyDraft> {
  const can = (code: (typeof PERMISSION)[keyof typeof PERMISSION]) =>
    permissions == null || hasPermission(permissions, code);

  const [margins, route, system, suppliers] = await Promise.all([
    can(PERMISSION.VIEW_MARGIN_POLICY) ? fetchMarginPolicies() : null,
    can(PERMISSION.VIEW_ROUTE_POLICY) ? fetchRoutePolicy() : null,
    can(PERMISSION.VIEW_SYSTEM_POLICY) ? fetchSystemPolicy() : null,
    can(PERMISSION.VIEW_SUPPLIER_POLICY) ? fetchSupplierPolicies() : null,
  ]);

  const base = createDefaultPolicyDraft(display);

  return {
    ...base,
    display,
    margin: margins ? marginRowsToPolicy(margins) : base.margin,
    route: route ? routeDtoToPolicy(route) : base.route,
    supplier: suppliers
      ? { quotes: suppliers.map(mapSupplierPolicyDto) }
      : base.supplier,
    system: system ? systemDtoToSettings(system) : base.system,
  };
}

export async function persistPolicyDraft(
  draft: PolicyDraft,
  sections: readonly PolicyPersistSection[] = [
    "margin",
    "route",
    "supplier",
    "system",
  ],
): Promise<void> {
  const tasks: Promise<void>[] = [];
  if (sections.includes("margin")) {
    tasks.push(updateMarginPolicies(marginPolicyToRows(draft.margin)));
  }
  if (sections.includes("route")) {
    tasks.push(updateRoutePolicy(routePolicyToDto(draft.route)));
  }
  if (sections.includes("system")) {
    tasks.push(updateSystemPolicy(systemSettingsToDto(draft.system)));
  }
  if (sections.includes("supplier")) {
    tasks.push(persistSupplierPolicy(draft.supplier));
  }
  await Promise.all(tasks);
}
