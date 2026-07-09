/**
 * src/features/auth/index.ts
 *
 * Public API for the auth feature slice.
 * External code should import from here rather than deep-linking into
 * store/, hooks/, components/, or services/ subdirectories.
 */

// Store
export { useAuthStore } from './store/authStore';
export type { AuthUser, PersistedAuthSession } from './store/authStorage';

// Hooks
export {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
} from './hooks/useAuth';

// Components
export { default as AuthModal } from './components/AuthModal';
