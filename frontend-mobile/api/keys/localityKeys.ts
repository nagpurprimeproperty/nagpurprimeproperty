// api/keys/localityKeys.ts
//
// Single source of truth for locality React Query cache keys.

export const localityKeys = {
  popularLocalities: () => ['popular-localities'] as const,
} as const;
