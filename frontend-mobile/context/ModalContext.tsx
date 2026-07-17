import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModalContextValue {
  /** Whether the auth bottom-sheet is currently visible */
  authModalVisible: boolean;
  /**
   * Optional hint about which action triggered the modal
   * (e.g. "saveProperty", "viewContact", "subscription").
   * Consumed by AuthModal to customise copy if needed.
   */
  authAction: string | null;
  /** Show the auth modal, optionally annotated with a trigger action */
  openAuth: (action?: string) => void;
  /** Hide the auth modal and clear the trigger action */
  closeAuth: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ModalContext = createContext<ModalContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authAction, setAuthAction] = useState<string | null>(null);

  const openAuth = useCallback((action?: string) => {
    setAuthAction(action ?? null);
    setAuthModalVisible(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthModalVisible(false);
    setAuthAction(null);
  }, []);

  const value = useMemo(
    () => ({ authModalVisible, authAction, openAuth, closeAuth }),
    [authModalVisible, authAction, openAuth, closeAuth]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal must be used inside <ModalProvider>');
  }
  return ctx;
}
