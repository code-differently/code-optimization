'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Student, StudentFilters, PaginationParams, PaginatedResponse } from '@/types';
import { studentsApi } from '@/lib/api';
import { StudentCard } from '@/components/StudentCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PerformanceStats } from '@/components/PerformanceStats';
import { StudentFiltersComponent } from '@/components/StudentFilters';
import { StudentCardSkeleton } from '@/components/StudentCardSkeleton';
import { Pagination } from '@/components/Pagination';
import { VirtualStudentGrid } from '@/components/VirtualStudentGrid';
import { useRenderingPerformance } from '@/hooks/useRenderingPerformance';
import { useStudents } from '@/hooks/useStudents';
import { usePrefetchAdjacentPages } from '@/hooks/usePrefetchAdjacentPages';
import {
  Users,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Loader2,
} from 'lucide-react';

// Utility functions for URL parameter handling
const parseFiltersFromURL = (searchParams: URLSearchParams): StudentFilters => {
  const filters: StudentFilters = {};

  const major = searchParams.get('major');
  if (major) filters.major = major;

  const year = searchParams.get('year');
  if (year) {
    const yearNum = parseInt(year);
    if (!isNaN(yearNum)) filters.year = yearNum;
  }

  const gpaMin = searchParams.get('gpaMin');
  if (gpaMin) {
    const gpaMinNum = parseFloat(gpaMin);
    if (!isNaN(gpaMinNum)) filters.gpaMin = gpaMinNum;
  }

  const gpaMax = searchParams.get('gpaMax');
  if (gpaMax) {
    const gpaMaxNum = parseFloat(gpaMax);
    if (!isNaN(gpaMaxNum)) filters.gpaMax = gpaMaxNum;
  }

  return filters;
};

const updateURLWithFilters = (router: any, filters: StudentFilters) => {
  const params = new URLSearchParams();

  if (filters.major) params.set('major', filters.major);
  if (filters.year !== undefined) params.set('year', filters.year.toString());
  if (filters.gpaMin !== undefined) params.set('gpaMin', filters.gpaMin.toString());
  if (filters.gpaMax !== undefined) params.set('gpaMax', filters.gpaMax.toString());

  const queryString = params.toString();
  const newURL = queryString ? `/?${queryString}` : '/';

  router.push(newURL, { scroll: false });
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentFilters, setCurrentFilters] = useState<StudentFilters>({});
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(true);

  // Track rendering performance
  const { renderCount } = useRenderingPerformance('HomePage');

  // Use SWR for data fetching and caching
  const { students, pagination, loading, validating, error, refresh, invalidateCache, isCacheHit } =
    useStudents({
      filters: currentFilters,
      pagination: { page: currentPage, limit: pageSize },
      revalidateOnFocus: true,
      refreshInterval: 0, // No auto-refresh, manual control
    });

  // Prefetch adjacent pages for better navigation performance
  usePrefetchAdjacentPages({
    currentPage,
    totalPages: pagination.totalPages,
    pageSize,
    filters: currentFilters,
    enabled: !loading && !error, // Only prefetch when current data is loaded
  });

  const handleFiltersChange = (filters: StudentFilters) => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    setCurrentFilters(filters);
    // Update URL with new filters
    updateURLWithFilters(router, filters);
  };

  const handleRefresh = () => {
    // Force revalidation of current data
    refresh();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Initialize filters from URL on mount and when URL changes
  useEffect(() => {
    const filtersFromURL = parseFiltersFromURL(searchParams);
    setCurrentFilters(filtersFromURL);
    setCurrentPage(1);
  }, [searchParams]); // Re-run when search params change

  // Memoize currentFilters to prevent unnecessary re-renders
  const memoizedCurrentFilters = useMemo(
    () => currentFilters,
    [currentFilters.major, currentFilters.year, currentFilters.gpaMin, currentFilters.gpaMax]
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            disabled={validating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${validating ? 'animate-spin' : ''}`} />
            {validating ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
                <p className="text-sm text-gray-500">Performance Optimization Demo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Virtual Scrolling Toggle */}
              <div className="flex items-center gap-2">
                <label htmlFor="virtualScrolling" className="text-sm text-gray-700">
                  Virtual Scrolling:
                </label>
                <button
                  id="virtualScrolling"
                  onClick={() => setUseVirtualScrolling(!useVirtualScrolling)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    useVirtualScrolling ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useVirtualScrolling ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Cache Status Indicator */}
              {validating && !loading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Syncing...</span>
                </div>
              )}

              <button
                onClick={handleRefresh}
                disabled={validating}
                className={`inline-flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  validating
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${validating ? 'animate-spin' : ''}`} />
                {validating ? 'Syncing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Computer Science Students</h2>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  Showing {students.length} of {pagination.total} students
                  {pagination.total > pageSize &&
                    ` (Page ${currentPage} of ${pagination.totalPages})`}
                  .
                </p>
                {!loading && !validating && students.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${isCacheHit ? 'bg-green-500' : 'bg-blue-500'}`}
                    ></div>
                    <span
                      className={`text-xs font-medium ${isCacheHit ? 'text-green-600' : 'text-blue-600'}`}
                    >
                      {isCacheHit ? 'From Cache' : 'From Network'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StudentFiltersComponent
                onFiltersChange={handleFiltersChange}
                currentFilters={memoizedCurrentFilters}
                isLoading={loading}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.keys(currentFilters).length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-medium text-blue-900">Active filters:</span>
                  {currentFilters.major && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Major: {currentFilters.major}
                    </span>
                  )}
                  {currentFilters.year && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Year: {currentFilters.year}
                    </span>
                  )}
                  {(currentFilters.gpaMin !== undefined || currentFilters.gpaMax !== undefined) && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      GPA: {currentFilters.gpaMin || 0} - {currentFilters.gpaMax || 4}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleFiltersChange({})}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {students.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              The database might be empty or there could be a connection issue.
            </p>
          </div>
        ) : useVirtualScrolling ? (
          <>
            {/* Virtual Scrolling Grid */}
            <VirtualStudentGrid
              students={students}
              loading={loading}
              pageSize={pageSize}
              className="mb-8"
            />

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pageSize}
                  totalItems={pagination.total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  isLoading={loading}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Regular Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: Math.min(pageSize, 12) }, (_, index) => (
                  <StudentCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            )}

            {/* Pagination for regular mode */}
            {pagination.total > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pageSize}
                  totalItems={pagination.total}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  isLoading={loading}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Performance Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        {/* Collapsible Content */}
        {showPerformanceStats && (
          <div>
            {/* Header bar with collapse button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Performance Metrics</h3>
              <button
                onClick={() => {
                  console.log('Header collapse button clicked');
                  setShowPerformanceStats(false);
                }}
                className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-full shadow-lg transition-colors"
                title="Collapse performance stats"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Performance stats content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <PerformanceStats />
            </div>
          </div>
        )}

        {/* Toggle Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => {
              console.log('Toggle clicked, current state:', showPerformanceStats);
              setShowPerformanceStats(!showPerformanceStats);
            }}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset active:bg-gray-100 cursor-pointer"
            title="Toggle performance metrics"
            type="button"
          >
            <BarChart3 className="w-4 h-4" />
            Performance Stats {showPerformanceStats ? '(Expanded)' : '(Collapsed)'}
            <span>
              <ChevronUp className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
