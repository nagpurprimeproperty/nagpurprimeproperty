/**
 * authStorage.ts
 *
 * Secure persistence layer for the authenticated session.
 *
 * ── Why SecureStore, not AsyncStorage ────────────────────────────────────────
 * AsyncStorage writes to an unencrypted SQLite database that is readable by
 * any process on a rooted device (or via adb backup on debug builds). A JWT
 * found there can be replayed to impersonate the user indefinitely.
 *
 * expo-secure-store wraps:
 *   iOS    → Keychain Services  (hardware-backed on devices with Secure Enclave)
 *   Android → EncryptedSharedPreferences backed by the Android Keystore system
 *
 * The WHEN_UNLOCKED access policy means the OS refuses to decrypt the value
 * while the device screen is locked — an attacker with physical access to a
 * sleeping phone still cannot extract the token.
 *
 * ── What is stored here ───────────────────────────────────────────────────────
 * Only auth session data (JWT, user profile, phone). Non-sensitive preferences
 * (locality, coordinates, theme, onboarding flags) remain in AsyncStorage in
 * their own storage files and are NOT affected by this change.
 *
 * ── Public API ────────────────────────────────────────────────────────────────
 * persistAuthSession(session)  — write or erase the session
 * loadAuthSession()            — read the session on app start
 * clearAuthSession()           — wipe on logout
 *
 * The function signatures are identical to the previous AsyncStorage version
 * so no callers need updating.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as SecureStore from "expo-secure-store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  name: string;
  mobile: string;
  city?: string | null;
  area?: string | null;
  email?: string | null;
  avatar?: string | null;
}

export interface PersistedAuthSession {
  isAuthenticated: boolean;
  token: string | null;
  phone: string | null;
  user: AuthUser | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * SecureStore key for the serialised auth session.
 *
 * Naming constraints: SecureStore keys must match /^[\w.-]+$/ (letters,
 * digits, underscores, dots, hyphens). The old AsyncStorage key contained
 * hyphens which are fine here.
 */
const AUTH_SESSION_KEY = "nagpur-prime-property-auth-session";

/**
 * Access control policy applied to every SecureStore write.
 *
 * WHEN_UNLOCKED  → the OS decrypts the value only while the device is
 *                  unlocked (Face ID / fingerprint / PIN satisfied).
 *                  This is the most appropriate policy for a short-lived
 *                  JWT that is only needed when the user is actively using
 *                  the app.
 */
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * Persist the full auth session to the device's hardware-backed secure store.
 * Passing `null` is equivalent to calling clearAuthSession() and is the
 * correct way to erase the session on logout.
 */
export const persistAuthSession = async (
  session: PersistedAuthSession | null,
): Promise<void> => {
  if (!session) {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY, SECURE_STORE_OPTIONS);
    return;
  }

  await SecureStore.setItemAsync(
    AUTH_SESSION_KEY,
    JSON.stringify(session),
    SECURE_STORE_OPTIONS,
  );
};

/**
 * Load the persisted auth session from secure storage.
 * Returns null when no session exists or the stored value is corrupt
 * (in which case the corrupt entry is proactively deleted).
 */
export const loadAuthSession = async (): Promise<PersistedAuthSession | null> => {
  const rawSession = await SecureStore.getItemAsync(
    AUTH_SESSION_KEY,
    SECURE_STORE_OPTIONS,
  );

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as PersistedAuthSession;

    return {
      isAuthenticated: Boolean(parsedSession.token || parsedSession.isAuthenticated),
      token: parsedSession.token ?? null,
      phone: parsedSession.phone ?? null,
      user: parsedSession.user ?? null,
    };
  } catch {
    // Corrupt entry — delete it so the user is prompted to log in again
    // rather than being stuck in an unrecoverable boot loop.
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY, SECURE_STORE_OPTIONS);
    return null;
  }
};

/**
 * Erase the auth session from secure storage.
 * Call this on every logout path.
 */
export const clearAuthSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY, SECURE_STORE_OPTIONS);
};

