import React from 'react';
import { QueryClient, QueryClientProvider as RQProvider } from '@tanstack/react-query';

// Tek ve kalıcı bir QueryClient oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function QueryClientProvider({ children }) {
  return <RQProvider client={queryClient}>{children}</RQProvider>;
}
