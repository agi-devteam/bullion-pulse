import { useAuthStore } from "@/stores/use-auth-store";
import { clearAuthToken } from "@/lib/auth/token";

export async function signOut(): Promise<void> {
  clearAuthToken();
  useAuthStore.getState().clearSession();

  await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);

  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}
