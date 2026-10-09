import {
  AUTH_COOKIE_NAME,
  LEGACY_AUTH_COOKIE_NAMES,
} from "@/lib/auth/constants";

const cookieClearFlags = {
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 0,
};

export function clearAuthCookiesOnResponse(
  response: { cookies: { set: (name: string, value: string, options: object) => void } },
): void {
  for (const name of [AUTH_COOKIE_NAME, ...LEGACY_AUTH_COOKIE_NAMES]) {
    response.cookies.set(name, "", cookieClearFlags);
  }
}

export function clearAuthCookiesInBrowser(): void {
  if (typeof document === "undefined") return;
  const base = "Path=/; Max-Age=0; SameSite=Lax";
  for (const name of [AUTH_COOKIE_NAME, ...LEGACY_AUTH_COOKIE_NAMES]) {
    document.cookie = `${encodeURIComponent(name)}=; ${base}`;
  }
}
