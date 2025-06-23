'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Student, StudentFilters } from '@/types';
import { studentsApi } from '@/lib/api';
import { StudentCard } from '@/components/StudentCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PerformanceStats } from '@/components/PerformanceStats';
import { StudentFiltersComponent } from '@/components/StudentFilters';
import { useRenderingPerformance } from '@/hooks/useRenderingPerformance';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<StudentFilters>({});

  // Track rendering performance
  const { renderCount } = useRenderingPerformance('HomePage');

  const fetchStudents = async (filters?: StudentFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsApi.getAll(filters);
      setStudents(data);
      setCurrentFilters(filters || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: StudentFilters) => {
    // Update URL with new filters
    updateURLWithFilters(router, filters);
    // Fetch will happen in useEffect when URL changes
  };

  const handleRefresh = () => {
    fetchStudents(currentFilters);
  };

  // Initialize filters from URL on mount and when URL changes
  useEffect(() => {
    const filtersFromURL = parseFiltersFromURL(searchParams);
    fetchStudents(filtersFromURL);
  }, [searchParams]); // Re-run when search params change

  // Memoize currentFilters to prevent unnecessary re-renders
  const memoizedCurrentFilters = useMemo(
    () => currentFilters,
    [currentFilters.major, currentFilters.year, currentFilters.gpaMin, currentFilters.gpaMax]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading students...</p>
          <p className="mt-2 text-sm text-gray-500">
            Please wait while the data is being fetched from the database.
          </p>
        </div>
      </div>
    );
  }

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
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
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
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Computer Science Students</h2>
              <p className="text-gray-600">Showing {students.length} students.</p>
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

        {students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              The database might be empty or there could be a connection issue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}

        {/* Performance Stats */}
        <div className="mt-12">
          <PerformanceStats />
        </div>
      </main>
    </div>
  );
}
