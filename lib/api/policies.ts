import type { Channel, Gram } from "@/domain/primitives";
import { GRAMS } from "@/domain/primitives";
import type {
  DisplaySettings,
  MarginPolicy,
  PolicyDraft,
  RoutePolicy,
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

export async function fetchMarginPolicies(): Promise<MarginPolicyRowDto[]> {
  return apiGet<MarginPolicyRowDto[]>("/policies/margins");
}

export async function fetchRoutePolicy(): Promise<RoutePolicyDto> {
  return apiGet<RoutePolicyDto>("/policies/routes");
}

export async function fetchSystemPolicy(): Promise<SystemPolicyDto> {
  return apiGet<SystemPolicyDto>("/policies/systems");
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

export async function fetchPolicyDraft(
  display: DisplaySettings,
): Promise<PolicyDraft> {
  const [margins, route, system] = await Promise.all([
    fetchMarginPolicies(),
    fetchRoutePolicy(),
    fetchSystemPolicy(),
  ]);

  const base = createDefaultPolicyDraft(display);

  return {
    ...base,
    display,
    margin: marginRowsToPolicy(margins),
    route: routeDtoToPolicy(route),
    system: systemDtoToSettings(system),
  };
}

export async function persistPolicyDraft(draft: PolicyDraft): Promise<void> {
  await Promise.all([
    updateMarginPolicies(marginPolicyToRows(draft.margin)),
    updateRoutePolicy(routePolicyToDto(draft.route)),
    updateSystemPolicy(systemSettingsToDto(draft.system)),
  ]);
}
