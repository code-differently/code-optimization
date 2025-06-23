'use client';

import { useState, useEffect, useRef } from 'react';
import { StudentFilters } from '@/types';
import { Filter, X, Search } from 'lucide-react';

interface StudentFiltersProps {
  onFiltersChange: (filters: StudentFilters) => void;
  currentFilters?: StudentFilters;
  isLoading?: boolean;
}

export function StudentFiltersComponent({
  onFiltersChange,
  currentFilters = {},
  isLoading,
}: StudentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<StudentFilters>(currentFilters);
  const currentFiltersRef = useRef<string>('');

  // Sync local state with current filters from URL only when they actually change
  useEffect(() => {
    const currentFiltersString = JSON.stringify(currentFilters);
    if (currentFiltersString !== currentFiltersRef.current) {
      setFilters(currentFilters);
      currentFiltersRef.current = currentFiltersString;
    }
  }, [currentFilters]);

  // Available majors (in a real app, this might come from an API)
  const majors = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Computer Engineering',
    'Data Science',
    'Cybersecurity',
  ];

  const handleFilterChange = (key: keyof StudentFilters, value: any) => {
    const newFilters = { ...filters };

    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    setFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
          hasActiveFilters
            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        disabled={isLoading}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-500 rounded-full">
            {Object.keys(filters).length}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filter Students</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Major Filter */}
              <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
                  Major
                </label>
                <select
                  id="major"
                  value={filters.major || ''}
                  onChange={(e) => handleFilterChange('major', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Majors</option>
                  {majors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Year in School
                </label>
                <select
                  id="year"
                  value={filters.year || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'year',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year+</option>
                </select>
              </div>

              {/* GPA Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPA Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      placeholder="Min GPA"
                      min="0"
                      max="4"
                      step="0.1"
                      value={filters.gpaMin || ''}
                      onChange={(e) =>
                        handleFilterChange(
                          'gpaMin',
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max GPA"
                      min="0"
                      max="4"
                      step="0.1"
                      value={filters.gpaMax || ''}
                      onChange={(e) =>
                        handleFilterChange(
                          'gpaMax',
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters || isLoading}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
