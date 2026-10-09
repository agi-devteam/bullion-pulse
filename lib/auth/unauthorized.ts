import { useAuthStore } from "@/stores/use-auth-store";
import { clearAuthToken } from "@/lib/auth/token";

let redirecting = false;

export function handleUnauthorized(): void {
  clearAuthToken();
  useAuthStore.getState().clearSession();

  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  if (redirecting) return;

  redirecting = true;
  const params = new URLSearchParams();
  params.set("type", "unauthorized");
  if (window.location.pathname !== "/") {
    params.set("next", window.location.pathname);
  }
  window.location.assign(`/login?${params.toString()}`);
}

export function resetUnauthorizedRedirect(): void {
  redirecting = false;
}
