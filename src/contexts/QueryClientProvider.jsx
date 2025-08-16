import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query';

// Tek ve kalıcı bir QueryClient oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0
    }
  },
  // Global query error handler (gerekirse log için)
  logger: {
    log: console.log,
    warn: console.warn,
    error: (err) => {
      // React Query hatalarını konsola bas; toast’ı axios hallediyor
      if (import.meta.env.DEV) console.error('RQ Error:', err);
    }
  }
});

export default function QueryClientProvider({ children }) {
  const enableDevtools = (import.meta.env.DEV && import.meta.env.VITE_RQ_DEVTOOLS === '1');
  return (
    <RQProvider client={queryClient}>
      {children}
      {enableDevtools ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" /> : null}
    </RQProvider>
  );
}
