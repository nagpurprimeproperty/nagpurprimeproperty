'use client';
import { useQuery } from '@tanstack/react-query';
import { clientFetch } from '@/lib/fetcher';

export function useBlogs({ limit, ...options } = {}) {
  return useQuery({
    queryKey: ['blogs', limit],
    queryFn: () => clientFetch(`/api/blogs${limit ? `?limit=${limit}` : ''}`, { method: 'GET' }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}


export function useBlog(slug) {
  return useQuery({
    queryKey: ['blogs', slug],
    queryFn: () => clientFetch(`/api/blogs/${slug}`, { method: 'GET' }),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
