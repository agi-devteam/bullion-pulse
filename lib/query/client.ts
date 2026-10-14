import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Boot prefetches once; screens refetch on mount. Only intelligence polls.
        staleTime: 60 * 1000,
        refetchInterval: false,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  });
}
