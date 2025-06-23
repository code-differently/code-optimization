import useSWR from 'swr';
import { StudentFilters, PaginationParams, PaginatedResponse, Student } from '@/types';
import { studentsApi } from '@/lib/api';

// Custom fetcher function for SWR
const studentsFetcher = async (key: string): Promise<PaginatedResponse<Student>> => {
  const [, filtersStr, paginationStr] = key.split('|');

  const filters: StudentFilters = filtersStr ? JSON.parse(filtersStr) : {};
  const pagination: PaginationParams = paginationStr
    ? JSON.parse(paginationStr)
    : { page: 1, limit: 50 };

  return await studentsApi.getAll(filters, pagination);
};

// Generate cache key for SWR
const generateCacheKey = (filters: StudentFilters, pagination: PaginationParams): string => {
  const filtersStr = Object.keys(filters).length > 0 ? JSON.stringify(filters) : '';
  const paginationStr = JSON.stringify(pagination);
  return `students|${filtersStr}|${paginationStr}`;
};

interface UseStudentsOptions {
  filters?: StudentFilters;
  pagination?: PaginationParams;
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  dedupingInterval?: number;
}

export function useStudents(options: UseStudentsOptions = {}) {
  const {
    filters = {},
    pagination = { page: 1, limit: 50 },
    refreshInterval = 0, // No auto-refresh by default
    revalidateOnFocus = true,
    dedupingInterval = 2000, // Dedupe requests within 2 seconds
  } = options;

  const cacheKey = generateCacheKey(filters, pagination);

  const { data, error, isLoading, isValidating, mutate } = useSWR(cacheKey, studentsFetcher, {
    refreshInterval,
    revalidateOnFocus,
    revalidateOnReconnect: true,
    dedupingInterval,
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    // Cache data for 5 minutes
    focusThrottleInterval: 5000,
    // Add cache hit tracking
    onSuccess: (data, key, config) => {
      console.log('SWR Success:', { key, fromCache: !isValidating, timestamp: new Date() });
    },
  });

  return {
    students: data?.data || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    loading: isLoading,
    validating: isValidating,
    error: error?.message || null,
    refresh: mutate,
    // Helper methods
    invalidateCache: () => mutate(undefined, { revalidate: true }),
    updateCache: (newData: PaginatedResponse<Student>) => mutate(newData, { revalidate: false }),
    // Cache status
    isCacheHit: !isLoading && !isValidating && !!data,
    cacheKey,
  };
}

// Hook for prefetching data
export function usePrefetchStudents() {
  const prefetch = (filters: StudentFilters, pagination: PaginationParams) => {
    const cacheKey = generateCacheKey(filters, pagination);
    // This will start fetching the data and cache it
    return useSWR(cacheKey, studentsFetcher, {
      revalidateOnMount: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    });
  };

  return { prefetch };
}
