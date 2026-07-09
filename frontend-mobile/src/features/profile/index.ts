/**
 * src/features/profile/index.ts
 *
 * Public API for the profile feature slice.
 */

// Hooks
export { useProfile, useUpdateProfileMutation } from './hooks/useProfile';

// Keys
export { profileKeys } from './keys/profileKeys';

// Service types
export type { ProfileUpdatePayload } from './services/profileService';
