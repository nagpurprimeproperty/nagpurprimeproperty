import { useState, useEffect, useCallback, useMemo, useRef } from "react";

export interface UsePaginationProps<T> {
  data: T[] | undefined;
  totalPages?: number;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<any>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  resetDeps?: any[];
}

export function usePagination<T>({
  data,
  totalPages = 1,
  isLoading,
  isFetching,
  refetch,
  page,
  setPage,
  resetDeps = [],
}: UsePaginationProps<T>) {
  const [list, setList] = useState<T[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const lastResetSignatureRef = useRef<string | null>(null);

  // Reset page and list when dependencies (like filters or search query) change.
  // Use a content-based signature so a fresh array reference does not trigger a reset loop.
  const resetSignature = useMemo(() => {
    try {
      return resetDeps.length > 0 ? JSON.stringify(resetDeps) : "";
    } catch {
      return String(resetDeps ?? []);
    }
  }, [resetDeps]);

  useEffect(() => {
    if (lastResetSignatureRef.current === resetSignature) return;

    lastResetSignatureRef.current = resetSignature;
    setPage((prevPage) => (prevPage === 1 ? prevPage : 1));
    setList((prevList) => (prevList.length === 0 ? prevList : []));
  }, [resetSignature, setPage]);

  // Append new data to the list
  useEffect(() => {
    if (isLoading || isFetching) return;

    if (data && data.length > 0) {
      if (page === 1) {
        setList((prevList) => {
          if (
            prevList.length === data.length &&
            prevList.every((item, index) => item === data[index])
          ) {
            return prevList;
          }
          return data;
        });
      } else {
        setList((prev) => {
          const seen = new Set(prev.map((item: any) => item._id || item.id));
          const filtered = data.filter((item: any) => !seen.has(item._id || item.id));
          return filtered.length > 0 ? [...prev, ...filtered] : prev;
        });
      }
    } else if (page === 1) {
      setList((prevList) => (prevList.length === 0 ? prevList : []));
    }
  }, [data, isLoading, isFetching, page]);

  const loadMore = useCallback(() => {
    const hasMore = page < totalPages;
    if (hasMore && !isLoading && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [page, totalPages, isLoading, isFetching, setPage]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch, setPage]);

  const hasMore = page < totalPages;
  const isLoadingMore = (isLoading || isFetching) && page > 1;
  const initialLoading = (isLoading || isFetching) && page === 1;

  // Derive display list to prevent brief empty state flashing on initial load
  // and load-more transition flashes on subsequent pages
  const displayedList = useMemo(() => {
    if (page === 1) {
      return data ?? [];
    }

    if (data && data.length > 0) {
      const seen = new Set(list.map((item: any) => item._id || item.id));
      const newItems = data.filter((item: any) => !seen.has(item._id || item.id));
      if (newItems.length > 0) {
        return [...list, ...newItems];
      }
    }

    return list;
  }, [data, list, page]);

  return {
    list: displayedList,
    setList,
    hasMore,
    isLoadingMore,
    initialLoading,
    refreshing,
    loadMore,
    handleRefresh,
  };
}
