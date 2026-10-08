const DEFAULT_API_BASE_URL =
  "https://lavina-coinable-ares.ngrok-free.dev";

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return (fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  );
}
