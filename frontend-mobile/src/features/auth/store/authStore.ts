import { create } from "zustand";
import type { AuthUser, PersistedAuthSession } from "@/features/auth/store/authStorage";
import {
  clearAuthSession,
  loadAuthSession,
  persistAuthSession,
} from "@/features/auth/store/authStorage";
// Static import is now safe — the circular dep that forced dynamic import() is gone:
//   authStore → socket → api/config  (no longer touches authStore or apiClient)
import { initSocket, disconnectSocket } from "@/config/socket";

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  phone: string | null;
  token: string | null;
  user: AuthUser | null;

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
      initSocket(hydratedState.token);
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
    };

    set(nextState);
    await persistState(nextState);

    // Initialize socket on login
    initSocket(token);
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
    disconnectSocket();
    set({
      isAuthenticated: false,
      isHydrated: true,
      phone: null,
      token: null,
      user: null,
    });
  },
}));

hydrateAuth(useAuthStore.setState);
