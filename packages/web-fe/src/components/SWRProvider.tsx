'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global configuration for SWR
        refreshInterval: 0, // Disable auto-refresh by default
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        // Cache configuration
        provider: () => new Map(),
        // Global error handler
        onError: (error) => {
          console.error('SWR Error:', error);
        },
        // Global success handler
        onSuccess: (data, key) => {
          console.log('SWR Success:', key, data);
        },
        // Loading timeout
        loadingTimeout: 10000,
        // Fallback data when error occurs
        fallback: {},
      }}
    >
      {children}
    </SWRConfig>
  );
}
