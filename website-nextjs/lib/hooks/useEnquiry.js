'use client';
import { useMutation } from '@tanstack/react-query';
import { clientFetch } from '@/lib/fetcher';

export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: ({ propertyId, data, token }) =>
      clientFetch(`/api/properties/${propertyId}/enquiry`, {
        method: 'POST',
        body: data,
        auth: token,
      }),
  });
}

export function useSubmitCallEnquiry() {
  return useMutation({
    mutationFn: ({ propertyId, token }) =>
      clientFetch(`/api/properties/${propertyId}/call-enquiry`, {
        method: 'POST',
        auth: token,
      }),
  });
}
