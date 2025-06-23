import { useEffect } from 'react';
import { StudentFilters, PaginationParams } from '@/types';
import { useSWRConfig } from 'swr';
import { studentsApi } from '@/lib/api';

// Generate cache key for SWR (same as in useStudents.ts)
const generateCacheKey = (filters: StudentFilters, pagination: PaginationParams): string => {
  const filtersStr = Object.keys(filters).length > 0 ? JSON.stringify(filters) : '';
  const paginationStr = JSON.stringify(pagination);
  return `students|${filtersStr}|${paginationStr}`;
};

// Fetcher function (same as in useStudents.ts)
const studentsFetcher = async (key: string) => {
  const [, filtersStr, paginationStr] = key.split('|');

  const filters: StudentFilters = filtersStr ? JSON.parse(filtersStr) : {};
  const pagination: PaginationParams = paginationStr
    ? JSON.parse(paginationStr)
    : { page: 1, limit: 50 };

  return await studentsApi.getAll(filters, pagination);
};

interface UsePrefetchAdjacentPagesOptions {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filters: StudentFilters;
  enabled?: boolean;
}

export function usePrefetchAdjacentPages({
  currentPage,
  totalPages,
  pageSize,
  filters,
  enabled = true,
}: UsePrefetchAdjacentPagesOptions) {
  const { cache, mutate } = useSWRConfig();

  useEffect(() => {
    if (!enabled) return;

    const prefetchPage = async (page: number) => {
      if (page < 1 || page > totalPages) return;

      const pagination = { page, limit: pageSize };
      const cacheKey = generateCacheKey(filters, pagination);

      // Check if already cached
      if (cache.get(cacheKey)) return;

      try {
        // Prefetch the data
        const data = await studentsFetcher(cacheKey);
        // Store in cache without triggering revalidation
        mutate(cacheKey, data, { revalidate: false });
      } catch (error) {
        console.warn(`Failed to prefetch page ${page}:`, error);
      }
    };

    // Prefetch adjacent pages with a small delay to not interfere with current request
    const prefetchTimer = setTimeout(() => {
      // Prefetch next page
      if (currentPage < totalPages) {
        prefetchPage(currentPage + 1);
      }

      // Prefetch previous page
      if (currentPage > 1) {
        prefetchPage(currentPage - 1);
      }

      // Prefetch page after next (for faster navigation)
      if (currentPage + 1 < totalPages) {
        setTimeout(() => prefetchPage(currentPage + 2), 500);
      }
    }, 200);

    return () => clearTimeout(prefetchTimer);
  }, [currentPage, totalPages, pageSize, filters, enabled, cache, mutate]);

  // Return prefetch function for manual triggering
  const prefetchPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    const pagination = { page, limit: pageSize };
    const cacheKey = generateCacheKey(filters, pagination);

    return mutate(cacheKey, studentsFetcher(cacheKey), { revalidate: false });
  };

  return { prefetchPage };
}
