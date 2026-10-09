import { getApiBaseUrl } from "@/lib/api/config";
import { AUTH_INFO_PATH } from "@/lib/auth/constants";
import { toBearerAuthorization } from "@/lib/auth/token";

export async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${AUTH_INFO_PATH}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: toBearerAuthorization(accessToken),
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });
    if (response.status === 401) return false;
    return response.ok;
  } catch {
    return false;
  }
}
