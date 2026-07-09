// api/keys/leadKeys.ts
//
// Single source of truth for lead React Query cache keys.

export const leadKeys = {
  /** All leads — invalidates the entire leads scope */
  all: ['leads'] as const,

  /** Paginated leads list */
  list: (page: number, limit: number) =>
    [...leadKeys.all, page, limit] as const,

  /** Single lead detail */
  detail: (id: string | undefined) => ['lead', id] as const,
} as const;
