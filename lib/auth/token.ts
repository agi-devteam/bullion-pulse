import { clearAuthCookiesInBrowser } from "@/lib/auth/clear-auth-cookies";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

function cookieFlags(): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  return `Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;

  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = decodeURIComponent(part.slice(0, eq));
    if (name !== AUTH_COOKIE_NAME) continue;
    const value = decodeURIComponent(part.slice(eq + 1));
    return value.length > 0 ? value : null;
  }

  return null;
}

export function setAuthToken(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(AUTH_COOKIE_NAME)}=${encodeURIComponent(token)}; ${cookieFlags()}`;
}

export function clearAuthToken(): void {
  clearAuthCookiesInBrowser();
}

export function toBearerAuthorization(accessToken: string): string {
  const trimmed = accessToken.trim();
  if (/^bearer\s+/i.test(trimmed)) return trimmed;
  return `Bearer ${trimmed}`;
}
