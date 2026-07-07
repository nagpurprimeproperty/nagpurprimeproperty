'use client';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { clientFetch } from '@/lib/fetcher';

export function useProperties(filters = {}, options = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
  ).toString();

  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const res = await fetch(`/api/properties${qs ? `?${qs}` : ''}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || `Request failed: ${res.status}`);
      }
      const json = await res.json();
      return {
        data: json.data || [],
        total: json.total || 0,
        page: json.page || 1,
        limit: json.limit || 12,
        totalPages: json.totalPages || 1,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}


export function useProperty(id) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => clientFetch(`/api/properties/${id}`, { method: 'GET' }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSimilarProperties(id) {
  return useQuery({
    queryKey: ['similar', id],
    queryFn: () => clientFetch(`/api/properties/${id}/similar`, { method: 'GET' }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveToggle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }) =>
      clientFetch(`/api/properties/${id}/save`, { method: 'POST', auth: token }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved'] });
    },
  });
}

export function useSearchSuggestions(query) {
  return useQuery({
    queryKey: ['suggestions', query],
    queryFn: () =>
      clientFetch(`/api/properties/suggestions?q=${encodeURIComponent(query)}`, { method: 'GET' }),
    enabled: query.length > 1,
    staleTime: 30 * 1000,
  });
}
