// api/keys/profileKeys.ts
//
// Single source of truth for profile React Query cache keys.
// Previously a local PROFILE_QUERY_KEY constant was defined in
// useProfileHook.ts, and useAuthHook.ts hardcoded ["profile"] directly.

export const profileKeys = {
  /** Root key — used for the authenticated user's profile */
  all: ['profile'] as const,
} as const;
