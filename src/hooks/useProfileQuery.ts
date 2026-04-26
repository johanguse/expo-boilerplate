import { getCurrentUser, type UserProfile } from "@api/auth";
import { queryKeys } from "@api/query-keys";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the current user's profile.
 *
 * Usage:
 * ```tsx
 * const { data: profile, isLoading, error } = useProfileQuery();
 * ```
 */
export function useProfileQuery() {
  return useQuery<UserProfile>({
    queryKey: queryKeys.profile.me(),
    queryFn: getCurrentUser,
  });
}
