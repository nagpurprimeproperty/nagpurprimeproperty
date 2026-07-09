// api/keys/staticPageKeys.ts
//
// Single source of truth for static-page React Query cache keys.

export const staticPageKeys = {
  /** Root scope — all static pages */
  all: ['static-pages'] as const,

  privacyPolicy:      () => [...staticPageKeys.all, 'privacy-policy']      as const,
  termsAndConditions: () => [...staticPageKeys.all, 'terms-and-conditions'] as const,
  aboutUs:            () => [...staticPageKeys.all, 'about-us']             as const,
  contactUs:          () => [...staticPageKeys.all, 'contact-us']           as const,
} as const;
