// api/keys/notificationKeys.ts
//
// Single source of truth for notification React Query cache keys.
// Both useNotification.ts and useSocket.ts used a local NOTIFICATIONS_KEY
// constant; centralising here removes that duplication and ensures every
// setQueriesData / invalidateQueries call hits the same prefix.

export const notificationKeys = {
  /** Root prefix — matches ALL notification queries (use with exact: false) */
  all: ['notifications'] as const,

  /** Paginated list with specific page + limit */
  list: (page: number, limit: number) =>
    [...notificationKeys.all, { page, limit }] as const,
} as const;
