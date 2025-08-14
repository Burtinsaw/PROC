/* global require */
import React from 'react';

// Guarded import so build doesn't crash if dependency failed to install yet
let QueryClientLib;
let QueryClientClass = class { constructor(){ this.defaultOptions={} } };
let ProviderShim = ({ children }) => children;
try {
  const req = typeof require !== 'undefined' ? require : null;
  if (req) {
    const pkg = req('@tanstack/react-query');
    QueryClientLib = pkg;
    QueryClientClass = pkg.QueryClient;
    ProviderShim = pkg.QueryClientProvider;
  } else {
    throw new Error('require is not available');
  }
} catch (e) {
  if (import.meta?.env?.MODE !== 'production') {
    console.warn('[react-query] Paket yüklenemedi, geçici shim kullanılıyor:', e.message);
  }
}

const queryClient = new QueryClientClass({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    }
  }
});

export default function QueryClientProvider({ children }) {
  // If real provider available wrap, else passthrough
  if (QueryClientLib) return <ProviderShim client={queryClient}>{children}</ProviderShim>;
  return <>{children}</>;
}
