import { useState, useEffect, useCallback, useMemo } from "react";

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

  // Reset page and list when dependencies (like filters or search query) change
  const serializedDeps = useMemo(() => {
    return resetDeps.length > 0 ? JSON.stringify(resetDeps) : "";
  }, [resetDeps]);

  useEffect(() => {
    setPage(1);
    setList([]);
  }, [serializedDeps, setPage]);

  // Append new data to the list
  useEffect(() => {
    if (isLoading || isFetching) return;

    if (data && data.length > 0) {
      if (page === 1) {
        setList(data);
      } else {
        setList((prev) => {
          const seen = new Set(prev.map((item: any) => item._id || item.id));
          const filtered = data.filter((item: any) => !seen.has(item._id || item.id));
          return [...prev, ...filtered];
        });
      }
    } else if (page === 1) {
      setList([]);
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
