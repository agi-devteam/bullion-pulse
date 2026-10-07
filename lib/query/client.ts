import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 2,
      },
    },
  });
}
