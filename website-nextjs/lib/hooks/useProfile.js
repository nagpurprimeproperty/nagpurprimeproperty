'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientFetch } from '@/lib/fetcher';

export function useProfile(token) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => clientFetch('/api/profile', { method: 'GET', auth: token }),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, token }) =>
      clientFetch('/api/profile', { method: 'PUT', body: data, auth: token }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUserStats(token) {
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => clientFetch('/api/profile/stats', { method: 'GET', auth: token }),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useSavedProperties(token, page = 1, limit = 12) {
  return useQuery({
    queryKey: ['saved', token, page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/profile/saved?page=${page}&limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

export function useAllSavedPropertyIds(token) {
  return useQuery({
    queryKey: ['saved', 'all-ids', token],
    queryFn: async () => {
      const res = await fetch(`/api/profile/saved?limit=1000`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || `Request failed: ${res.status}`);
      }
      const json = await res.json();
      const items = json.data || [];
      return items.map(p => p._id || p.id);
    },
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

