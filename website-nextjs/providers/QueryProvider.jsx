'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import dynamic from 'next/dynamic';

const ReactQueryDevtools = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('@tanstack/react-query-devtools').then(m => m.ReactQueryDevtools), { ssr: false })
  : () => null;

export default function QueryProvider({ children }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
