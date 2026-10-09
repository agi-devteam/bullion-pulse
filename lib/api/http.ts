import { getApiBaseUrl } from "@/lib/api/config";
import {
  getAuthToken,
  toBearerAuthorization,
} from "@/lib/auth/token";
import { handleUnauthorized } from "@/lib/auth/unauthorized";

const AUTH_OPEN_PATHS = new Set([
  "/auth/credentials",
  "/auth/verification",
]);

function isAuthOpenPath(path: string): boolean {
  return AUTH_OPEN_PATHS.has(path);
}

function errorMessageFromBody(body: unknown, status: number): string {
  if (typeof body === "string" && body.length > 0) return body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.length > 0) {
      return record.message;
    }
    if (typeof record.error === "string" && record.error.length > 0) {
      return record.error;
    }
  }
  return `Request failed (${status})`;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly endpoint: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiTimeoutError extends Error {
  constructor(
    readonly endpoint: string,
    readonly timeoutMs: number,
  ) {
    super(`Request timed out after ${timeoutMs}ms (${endpoint})`);
    this.name = "ApiTimeoutError";
  }
}

type JsonBody = unknown;

export type ApiRequestOptions = RequestInit & {
  timeoutMs?: number;
};

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  init: ApiRequestOptions = {},
): Promise<T> {
  const { timeoutMs, signal: userSignal, ...rest } = init;
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(rest.headers);
  headers.set("Accept", "application/json");
  headers.set("ngrok-skip-browser-warning", "true");

  if (rest.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!isAuthOpenPath(path) && !headers.has("Authorization")) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", toBearerAuthorization(token));
    }
  }

  const controller = new AbortController();
  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (timeoutMs != null && timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
  }

  const onUserAbort = () => controller.abort();
  userSignal?.addEventListener("abort", onUserAbort);

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
      signal: controller.signal,
    });

    const body = await parseResponseBody(response);

    if (!response.ok) {
      if (response.status === 401 && !isAuthOpenPath(path)) {
        handleUnauthorized();
      }
      throw new ApiError(
        response.status,
        path,
        errorMessageFromBody(body, response.status),
      );
    }

    return body as T;
  } catch (error) {
    if (timedOut) {
      throw new ApiTimeoutError(path, timeoutMs ?? 0);
    }
    throw error;
  } finally {
    if (timeoutId != null) clearTimeout(timeoutId);
    userSignal?.removeEventListener("abort", onUserAbort);
  }
}

export function apiGet<T>(
  path: string,
  options?: Pick<ApiRequestOptions, "timeoutMs" | "signal">,
): Promise<T> {
  return apiRequest<T>(path, { method: "GET", ...options });
}

export function apiPost<T>(path: string, body: JsonBody): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut<T = null>(path: string, body: JsonBody): Promise<T> {
  return apiRequest<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
