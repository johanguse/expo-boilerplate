/**
 * Centralized query key factory.
 *
 * Using a factory pattern keeps keys consistent and makes
 * invalidation / cache management predictable.
 *
 * @example
 *   useQuery({ queryKey: queryKeys.profile.me(), ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
 *
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/query-keys
 */
export const queryKeys = {
  // ── Profile ─────────────────────────────────────
  profile: {
    all: ["profile"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
  },

  // ── Example resource ────────────────────────────
  // items: {
  //   all:    ["items"] as const,
  //   list:   (filters: Record<string, unknown>) => [...queryKeys.items.all, "list", filters] as const,
  //   detail: (id: string) => [...queryKeys.items.all, "detail", id] as const,
  // },
} as const;
