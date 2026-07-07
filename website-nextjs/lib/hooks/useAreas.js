'use client';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/lib/fetcher';

export function useAreas(options = {}) {
  return useQuery({
    queryKey: ['areas'],
    queryFn: () => clientFetch('/api/areas', { method: 'GET' }),
    // Areas rarely change — keep fresh for 10 min, in-memory for 30 min
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
}

export function useArea(slug) {
  return useQuery({
    queryKey: ['areas', slug],
    queryFn: () => clientFetch(`/api/areas/${slug}`, { method: 'GET' }),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
