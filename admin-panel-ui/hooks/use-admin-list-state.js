"use client";

import { useCallback, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * Shared search + pagination state for server-filtered admin list pages.
 */
export function useAdminListState(options = {}) {
  const { debounceMs = 400 } = options;
  const [searchInput, setSearchInputState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchInput, debounceMs);

  const handleSearchChange = useCallback((e) => {
    setSearchInputState(e.target.value);
    setCurrentPage(1);
  }, []);

  /** Wrap a setState setter so changing a filter resets to page 1 */
  const withResetPage = useCallback((setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  }, []);

  const resetToFirstPage = useCallback(() => setCurrentPage(1), []);

  return {
    searchInput,
    setSearchInput: setSearchInputState,
    debouncedSearch,
    currentPage,
    setCurrentPage,
    handleSearchChange,
    withResetPage,
    resetToFirstPage,
  };
}
