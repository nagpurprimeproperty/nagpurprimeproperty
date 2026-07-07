"use client"

/**
 * data-context.jsx — STUB
 *
 * This context previously held mock data for brokers, customers, properties,
 * plans, notifications, and transactions. All data is now served from the
 * real API via TanStack Query hooks.
 *
 * The DataProvider and useData exports are kept as a no-op stub so that any
 * accidental import elsewhere doesn't crash the app. If you find a component
 * that still calls useData(), migrate it to the appropriate API hook.
 */

import { createContext, useContext } from "react";

const DataContext = createContext({});

export function DataProvider({ children }) {
  return <DataContext.Provider value={{}}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
