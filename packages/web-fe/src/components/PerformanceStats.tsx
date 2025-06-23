'use client';

import { useState, useEffect } from 'react';
import { studentsApi, getClientStats } from '@/lib/api';
import { Clock, Database, Server, Wifi, Activity, BarChart3 } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <Activity className="w-5 h-5 animate-spin text-blue-500 mr-2" />
          <span className="text-blue-700">Loading performance stats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <BarChart3 className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-900">Performance Stats Error</h3>
        </div>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-blue-900">Real-time Performance Statistics</h3>
        </div>
        <div className="text-xs text-blue-600">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Performance Insights */}
      <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
        <div className="flex items-center mb-2">
          <Clock className="w-4 h-4 text-orange-500 mr-2" />
          <h4 className="font-medium text-gray-900">Performance Insights</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="text-gray-600">
              🐌 Database delays are intentionally slow (1-3s per operation)
            </div>
            <div className="text-gray-600">
              📊 No caching implemented - every request hits the database
            </div>
            <div className="text-gray-600">🔄 API processes requests sequentially</div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-600">🌐 Frontend makes individual API calls</div>
            <div className="text-gray-600">💾 No client-side caching or state management</div>
            <div className="text-gray-600">🎯 Perfect for optimization demonstrations!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
