// api/keys/subscriptionKeys.ts
//
// Single source of truth for subscription React Query cache keys.

export const subscriptionKeys = {
  /** All available plans */
  plans: () => ['subscription-plans'] as const,

  /** Single plan detail */
  plan: (id: string | undefined) => ['subscription-plan', id] as const,

  /** The authenticated user's active subscription */
  mine: () => ['my-subscription'] as const,

  /** Paginated purchase history */
  history: () => ['purchase-history'] as const,
  historyPage: (page: number, limit: number) =>
    [...subscriptionKeys.history(), page, limit] as const,

  /** Single purchase receipt */
  purchase: (id: string | undefined) => ['purchase-detail', id] as const,
} as const;
