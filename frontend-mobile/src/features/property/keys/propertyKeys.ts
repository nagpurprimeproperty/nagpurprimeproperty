// api/keys/propertyKeys.ts
//
// Single source of truth for every React Query cache key that touches
// the properties domain. Use these factories everywhere — in hooks,
// mutation onSuccess handlers, and any manual invalidation — so that a
// typo can never silently break cache invalidation.

// ─── Public / browse ──────────────────────────────────────────────────────────

export const propertyKeys = {
  /** Root scope — invalidates ALL property queries */
  all: ['properties'] as const,

  /** Paginated / filtered browse list */
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters?: object) => [...propertyKeys.lists(), filters ?? {}] as const,

  /** Public property detail */
  detail: (id: string | undefined) =>
    [...propertyKeys.all, 'detail', id] as const,

  /** Similar properties for a given listing */
  similar: (id: string | undefined, params?: object) =>
    [...propertyKeys.all, 'similar', id, params ?? {}] as const,

  /** Saved / bookmarked properties */
  saved: () => [...propertyKeys.all, { isSaved: true }] as const,

  /** Search auto-complete suggestions */
  suggestions: (query: string) =>
    [...propertyKeys.all, 'suggestions', query] as const,
} as const;

// ─── My-listings (owner / seller view) ───────────────────────────────────────

export const myPropertyKeys = {
  /** Root scope — invalidates ALL my-property queries */
  all: ['myProperties'] as const,

  /** Paginated list of seller's own listings */
  lists: () => [...myPropertyKeys.all, 'list'] as const,
  list: (filters?: object) => [...myPropertyKeys.lists(), filters ?? {}] as const,

  /** Single listing owned by the seller */
  detail: (id: string | undefined) =>
    [...myPropertyKeys.all, 'detail', id] as const,
} as const;

// ─── Enquiries ────────────────────────────────────────────────────────────────

export const enquiryKeys = {
  all: ['enquiries'] as const,
} as const;
