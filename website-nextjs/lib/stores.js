import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect } from "react";

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuth = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      showAuthModal: false,
      openAuth: () => set({ showAuthModal: true }),
      closeAuth: () => set({ showAuthModal: false }),
      login: (u, t) => set({ user: u, token: t ?? null }),
      updateUser: (patch) => {
        const cur = get().user;
        if (!cur) return;
        set({ user: { ...cur, ...patch } });
      },
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "nh-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist user + token. Functions/UI state are never serialized.
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);

// ─── Client-only auth hook (SSR-safe) ─────────────────────────────────────────
//
// The ONLY correct pattern for Next.js SSR + Zustand:
//   1. Always render null on server (and first client render) → no hydration mismatch
//   2. After mount, subscribe to the real Zustand state
//
// Why not useState(() => readLocalStorage())?  Because that initializer runs on
// the client first-render AFTER server has already rendered null → mismatch crash.
//
export function useClientAuth() {
  const [mounted, setMounted] = useState(false);
  // These reactive subscriptions are always correct AFTER mount
  const token = useAuth((s) => s.token);
  const user  = useAuth((s) => s.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null before mount so server HTML matches first client render
  return {
    token: mounted ? token : null,
    user:  mounted ? user  : null,
    mounted,
  };
}

// ─── Synchronous token read for click handlers ────────────────────────────────
//
// Use this ONLY inside event handlers (onClick etc.), never during render.
// Checks both Zustand in-memory state AND localStorage so it works regardless
// of whether Zustand has hydrated yet.
//
export function getPersistedAuth() {
  if (typeof window === "undefined") return { token: null, user: null };

  // 1. Zustand in-memory state (fastest path — available after module load)
  const s = useAuth.getState();
  if (s.token && s.user) return { token: s.token, user: s.user };

  // 2. Direct localStorage read (fallback for any edge case)
  try {
    const raw = localStorage.getItem("nh-auth");
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    const st = parsed?.state;
    return { token: st?.token ?? null, user: st?.user ?? null };
  } catch {
    return { token: null, user: null };
  }
}

// ─── Simple hydration guard for non-auth persisted stores ─────────────────────
// Use this to gate useFavorites / useUnlocked reads during render so SSR and
// first client render both see the default empty state (no mismatch).
export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// ─── Favorites Store ──────────────────────────────────────────────────────────
export const useFavorites = create()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set({
          ids: get().ids.includes(id)
            ? get().ids.filter((x) => x !== id)
            : [...get().ids, id],
        }),
      has: (id) => get().ids.includes(id),
      setIds: (ids) => set({ ids: Array.isArray(ids) ? ids : [] }),
    }),
    { name: "nh-favorites" },
  ),
);

// ─── Viewed Store ─────────────────────────────────────────────────────────────
export const useViewed = create()(
  persist(
    (set, get) => ({
      ids: [],
      push: (id) =>
        set({
          ids: [id, ...get().ids.filter((x) => x !== id)].slice(0, 100),
        }),
    }),
    { name: "nh-viewed" },
  ),
);

// ─── Unlocked Brokers Store ───────────────────────────────────────────────────
export const useUnlocked = create()(
  persist(
    (set, get) => ({
      brokerIds: [],
      unlock: (brokerId) =>
        set({
          brokerIds: Array.from(new Set([...get().brokerIds, brokerId])),
        }),
      isUnlocked: (brokerId) => get().brokerIds.includes(brokerId),
    }),
    { name: "nh-unlocked" },
  ),
);

// ─── Leads Store ─────────────────────────────────────────────────────────────
export const useLeads = create()(
  persist(
    (set, get) => ({
      leads: [],
      add: (l) =>
        set({
          leads: [
            {
              ...l,
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
            },
            ...get().leads,
          ],
        }),
    }),
    { name: "nh-leads" },
  ),
);
