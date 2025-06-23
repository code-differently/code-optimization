export function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Name skeleton */}
          <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2"></div>

          {/* Email skeleton */}
          <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-3"></div>

          {/* Info grid skeleton */}
          <div className="grid grid-cols-2 gap-3">
            {/* Major */}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>

            {/* Year */}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>

            {/* GPA */}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>

            {/* Phone */}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
