import { useSWRConfig } from 'swr';
import { useState, useEffect } from 'react';
import { Database, RefreshCw, Trash2, Clock } from 'lucide-react';

export function CacheManager() {
  const { cache, mutate } = useSWRConfig();
  const [cacheStats, setCacheStats] = useState({
    totalKeys: 0,
    totalSize: 0,
    keys: [] as string[],
  });

  useEffect(() => {
    const updateStats = () => {
      if (cache instanceof Map) {
        const keys = Array.from(cache.keys());
        const totalSize = JSON.stringify(Array.from(cache.entries())).length;

        setCacheStats({
          totalKeys: keys.length,
          totalSize,
          keys: keys.filter((key) => typeof key === 'string' && key.includes('students')),
        });
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [cache]);

  const clearCache = () => {
    // Clear all student-related cache entries
    cacheStats.keys.forEach((key) => {
      mutate(key, undefined, { revalidate: false });
    });
  };

  const revalidateAll = () => {
    // Revalidate all student-related cache entries
    cacheStats.keys.forEach((key) => {
      mutate(key, undefined, { revalidate: true });
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">SWR Cache Manager</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Cache Entries</div>
          <div className="text-2xl font-bold text-blue-900">{cacheStats.totalKeys}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Student Queries</div>
          <div className="text-2xl font-bold text-green-900">{cacheStats.keys.length}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Cache Size</div>
          <div className="text-2xl font-bold text-purple-900">
            {formatSize(cacheStats.totalSize)}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={revalidateAll}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh All
        </button>
        <button
          onClick={clearCache}
          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cache
        </button>
      </div>

      {cacheStats.keys.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Cached Student Queries:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {cacheStats.keys.slice(0, 5).map((key, index) => (
              <div key={index} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono truncate">{key}</span>
                </div>
              </div>
            ))}
            {cacheStats.keys.length > 5 && (
              <div className="text-xs text-gray-400 text-center">
                ... and {cacheStats.keys.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
