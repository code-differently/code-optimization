'use client';

import { useState, useEffect } from 'react';
import { studentsApi, getClientStats } from '@/lib/api';
import { getRenderingStats } from '@/hooks/useRenderingPerformance';
import { Clock, Database, Server, Wifi, Activity, BarChart3, Monitor } from 'lucide-react';
import { CacheManager } from './CacheManager';

interface DatabaseStats {
  totalOperations: number;
  operationCounts: Record<string, number>;
  averageOperationTimes: Record<string, number>;
  uptimeMs: number;
  uptimeSeconds: number;
}

interface ServerStats {
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  uptime: number;
  nodeVersion: string;
  platform: string;
}

interface PerformanceData {
  database: DatabaseStats;
  server: ServerStats;
  timestamp: string;
}

export function PerformanceStats() {
  const [stats, setStats] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await studentsApi.getStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const clientStats = getClientStats();
  const renderingStats = getRenderingStats();

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-50 border-t border-blue-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <Activity className="w-5 h-5 animate-spin text-blue-500 mr-2" />
            <span className="text-blue-700">Loading performance stats...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-50 border-t border-red-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={fetchStats}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-50 border-t border-blue-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <BarChart3 className="w-4 h-4 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-blue-900">Performance Stats</h3>
          </div>
          <div className="text-xs text-blue-600">Updated: {lastUpdated.toLocaleTimeString()}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Database Layer Stats */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-3">
              <Database className="w-4 h-4 text-green-500 mr-2" />
              <h4 className="font-medium text-gray-900">Database Layer</h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Operations:</span>
                <span className="font-medium">{stats?.database.totalOperations || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">{stats?.database.uptimeSeconds || 0}s</span>
              </div>

              {stats?.database.operationCounts &&
                Object.entries(stats.database.operationCounts).map(([op, count]) => (
                  <div key={op} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{op}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}

              {stats?.database.averageOperationTimes && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Avg Times (ms):</div>
                  {Object.entries(stats.database.averageOperationTimes).map(([op, time]) => (
                    <div key={op} className="flex justify-between text-xs">
                      <span className="text-gray-600 capitalize">{op}:</span>
                      <span className="font-medium">{time}ms</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* API Layer Stats */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-3">
              <Server className="w-4 h-4 text-blue-500 mr-2" />
              <h4 className="font-medium text-gray-900">API Layer</h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">{stats?.server.uptime || 0}s</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Memory (RSS):</span>
                <span className="font-medium">{stats?.server.memoryUsage.rss || 0}MB</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Heap Used:</span>
                <span className="font-medium">{stats?.server.memoryUsage.heapUsed || 0}MB</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Node.js:</span>
                <span className="font-medium text-xs">{stats?.server.nodeVersion || 'N/A'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium text-xs">{stats?.server.platform || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Frontend Layer Stats */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-3">
              <Wifi className="w-4 h-4 text-purple-500 mr-2" />
              <h4 className="font-medium text-gray-900">Frontend Layer</h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Requests:</span>
                <span className="font-medium">{clientStats.totalRequests}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response:</span>
                <span className="font-medium">{clientStats.averageRequestTime}ms</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Fastest:</span>
                <span className="font-medium text-green-600">{clientStats.fastestRequest}ms</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Slowest:</span>
                <span className="font-medium text-red-600">{clientStats.slowestRequest}ms</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Errors:</span>
                <span
                  className={`font-medium ${
                    clientStats.errors > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {clientStats.errors}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Session Time:</span>
                <span className="font-medium">{Math.round(clientStats.uptimeMs / 1000)}s</span>
              </div>
            </div>
          </div>

          {/* Rendering Performance Stats */}
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center mb-3">
              <Monitor className="w-4 h-4 text-indigo-500 mr-2" />
              <h4 className="font-medium text-gray-900">Rendering Performance</h4>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Renders:</span>
                <span className="font-medium">{renderingStats.totalRenders}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Avg Render:</span>
                <span className="font-medium">
                  {Math.round(renderingStats.averageRenderTime * 100) / 100}ms
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Fastest:</span>
                <span className="font-medium text-green-600">
                  {Math.round(renderingStats.fastestRender * 100) / 100}ms
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Slowest:</span>
                <span className="font-medium text-red-600">
                  {Math.round(renderingStats.slowestRender * 100) / 100}ms
                </span>
              </div>

              {renderingStats.paintTiming.length > 0 && (
                <>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Paint Timing:</div>
                    {renderingStats.paintTiming.map((paint, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">{paint.name}:</span>
                        <span className="font-medium">{Math.round(paint.startTime)}ms</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {renderingStats.navigationTiming && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">DOM Load:</span>
                  <span className="font-medium">
                    {Math.round(renderingStats.navigationTiming.domContentLoadedEventEnd)}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cache Manager Section */}
        <div className="mt-6">
          <CacheManager />
        </div>
      </div>
    </div>
  );
}
