import { create } from "zustand";
import type { AuthUser, PersistedAuthSession } from "@/lib/authStorage";
import {
  clearAuthSession,
  loadAuthSession,
  persistAuthSession,
} from "@/lib/authStorage";

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  phone: string | null;
  token: string | null;
  user: AuthUser | null;
  showAuthModal: boolean;
  authAction: string | null;

  openAuth: (action?: string) => void;
  closeAuth: () => void;
  setPhone: (phone: string) => Promise<void>;
  setSession: (session: {
    token: string;
    phone: string;
    user: AuthUser;
  }) => Promise<void>;
  updateUser: (user: AuthUser | null) => Promise<void>;
  logout: () => Promise<void>;
}

const persistState = async (state: PersistedAuthSession) => {
  await persistAuthSession(state);
};

const initialState: Omit<
  AuthState,
  | "openAuth"
  | "closeAuth"
  | "setPhone"
  | "setSession"
  | "updateUser"
  | "logout"
> = {
  isAuthenticated: false,
  isHydrated: false,
  phone: null,
  token: null,
  user: null,
  showAuthModal: false,
  authAction: null,
};

const hydrateAuth = async (set: (partial: Partial<AuthState>) => void) => {
  try {
    const hydratedState = await loadAuthSession();

    set({
      ...initialState,
      ...hydratedState,
      isHydrated: true,
    });

    // Reconnect socket if user was already logged in
    if (hydratedState?.isAuthenticated && hydratedState?.token) {
      // Lazy import to avoid circular dep at module load time
      import('@/lib/socket').then(({ initSocket }) => {
        initSocket(hydratedState.token!);
      }).catch(() => {});
    }
  } catch {
    set({
      ...initialState,
      isHydrated: true,
    });
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  openAuth: (action) =>
    set({ showAuthModal: true, authAction: action ?? null }),
  closeAuth: () =>
    set({ showAuthModal: false, authAction: null }),
  setPhone: async (phone) => {
    const nextState = {
      ...get(),
      phone,
    };

    set(nextState);
    await persistState({
      isAuthenticated: nextState.isAuthenticated,
      token: nextState.token,
      phone: nextState.phone,
      user: nextState.user,
    });
  },
  setSession: async ({ token, phone, user }) => {
    const nextState = {
      isAuthenticated: true,
      isHydrated: true,
      token,
      phone,
      user,
      showAuthModal: false,
      authAction: null,
    };

    set(nextState);
    await persistState(nextState);

    // Initialize socket on login
    import('@/lib/socket').then(({ initSocket }) => {
      initSocket(token);
    }).catch(() => {});
  },
  updateUser: async (user) => {
    // Always clone to a plain object to avoid getter-only assignment errors
    const plainUser = user ? JSON.parse(JSON.stringify(user)) : null;
    const nextState = {
      ...get(),
      user: plainUser,
    };

    set(nextState);
    await persistState({
      isAuthenticated: nextState.isAuthenticated,
      token: nextState.token,
      phone: nextState.phone,
      user: nextState.user,
    });
  },
  logout: async () => {
    await clearAuthSession();
    // Lazy import to avoid circular dependency at store instantiation
    // (This block was previously duplicated below, now consolidated to prevent redundant socket calls)
    import('@/lib/socket').then(({ disconnectSocket }) => {
      disconnectSocket();
    }).catch(() => {});
    set({
      isAuthenticated: false,
      isHydrated: true,
      phone: null,
      token: null,
      user: null,
      showAuthModal: false,
      authAction: null,
    });
  },
}));

hydrateAuth(useAuthStore.setState);
