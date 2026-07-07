'use client';
import { useMutation } from '@tanstack/react-query';
import { clientFetch } from '@/lib/fetcher';

export function useSendOTP() {
  return useMutation({
    mutationFn: ({ mobile, name }) =>
      clientFetch('/api/auth/login', { method: 'POST', body: { mobile, name } }),
  });
}

export function useVerifyOTP() {
  return useMutation({
    mutationFn: ({ mobile, otp }) =>
      clientFetch('/api/auth/verify', { method: 'POST', body: { mobile, otp } }),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: ({ token }) =>
      clientFetch('/api/auth/logout', { method: 'POST', auth: token }),
  });
}
