import { useState, useEffect, useRef, useMemo } from 'react';
import { Student } from '@/types';
import { StudentCard } from './StudentCard';
import { StudentCardSkeleton } from './StudentCardSkeleton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Loader2 } from 'lucide-react';

interface VirtualStudentGridProps {
  students: Student[];
  loading: boolean;
  pageSize: number;
  className?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  showInfiniteLoading?: boolean;
}

interface GridDimensions {
  columns: number;
  rowHeight: number;
  containerHeight: number;
}

export function VirtualStudentGrid({
  students,
  loading,
  pageSize,
  className = '',
  hasMore = false,
  onLoadMore,
  showInfiniteLoading = false,
}: VirtualStudentGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [dimensions, setDimensions] = useState<GridDimensions>({
    columns: 3,
    rowHeight: 280, // Approximate height of a student card including gap
    containerHeight: 600,
  });

  // Infinite scroll for loading more data
  const { loadMoreRef } = useInfiniteScroll(() => onLoadMore?.(), hasMore, loading);

  // Update dimensions based on screen size
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      let columns = 3; // lg: grid-cols-3

      if (width < 768) {
        columns = 1; // grid-cols-1
      } else if (width < 1024) {
        columns = 2; // md: grid-cols-2
      }

      setDimensions((prev) => ({
        ...prev,
        columns,
        containerHeight: Math.min(window.innerHeight - 300, 800), // Account for header/footer
      }));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Create grid items (group students by rows)
  const gridRows = useMemo(() => {
    if (loading && students.length === 0) {
      // Create skeleton rows for initial load
      const skeletonCount = Math.min(pageSize, 12);
      const skeletonRows = Math.ceil(skeletonCount / dimensions.columns);
      return Array.from({ length: skeletonRows }, (_, rowIndex) => {
        const startIndex = rowIndex * dimensions.columns;
        const endIndex = Math.min(startIndex + dimensions.columns, skeletonCount);
        return Array.from({ length: endIndex - startIndex }, (_, colIndex) => ({
          type: 'skeleton' as const,
          key: `skeleton-${startIndex + colIndex}`,
        }));
      });
    }

    const rows = [];
    for (let i = 0; i < students.length; i += dimensions.columns) {
      const rowStudents = students.slice(i, i + dimensions.columns);
      rows.push(rowStudents);
    }
    return rows;
  }, [students, loading, pageSize, dimensions.columns]);

  // Virtual scrolling calculations
  const { visibleRows, totalHeight } = useMemo(() => {
    const totalRows = gridRows.length;
    const totalHeight = totalRows * dimensions.rowHeight;

    const overscan = 3; // Number of rows to render outside visible area
    const startRow = Math.max(0, Math.floor(scrollTop / dimensions.rowHeight) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + dimensions.containerHeight) / dimensions.rowHeight) + overscan
    );

    const visibleRows = [];
    for (let i = startRow; i <= endRow; i++) {
      if (gridRows[i]) {
        visibleRows.push({
          index: i,
          top: i * dimensions.rowHeight,
          items: gridRows[i],
        });
      }
    }

    return { visibleRows, totalHeight };
  }, [gridRows, scrollTop, dimensions]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className={className}>
      {/* Performance indicator */}
      {students.length > 50 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Virtual Scrolling Active: Rendering {visibleRows.length} of {gridRows.length} rows for
              optimal performance
            </span>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: dimensions.containerHeight,
          overflow: 'auto',
        }}
        className="relative border border-gray-200 rounded-lg"
      >
        <div
          style={{
            height: totalHeight,
            position: 'relative',
          }}
        >
          {visibleRows.map((row) => (
            <div
              key={row.index}
              style={{
                position: 'absolute',
                top: row.top,
                left: 0,
                right: 0,
                height: dimensions.rowHeight,
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-2"
            >
              {loading && students.length === 0
                ? // Render skeleton items for initial load
                  row.items.map((item: any) => <StudentCardSkeleton key={item.key} />)
                : // Render student cards
                  (row.items as Student[]).map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
            </div>
          ))}

          {/* Infinite scroll trigger and loading indicator */}
          {hasMore && onLoadMore && (
            <div
              ref={loadMoreRef}
              style={{
                position: 'absolute',
                top: totalHeight - 100, // Position near the bottom
                left: 0,
                right: 0,
                height: 100,
              }}
              className="flex items-center justify-center"
            >
              {showInfiniteLoading && (
                <div className="flex items-center gap-2 text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading more students...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
