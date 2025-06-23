import { Student, ApiResponse, StudentFilters } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to get headers with ngrok bypass if needed
const getHeaders = (additionalHeaders?: HeadersInit): HeadersInit => {
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',
    ...additionalHeaders,
  };
  return headers;
};

// Performance tracking
let requestStats = {
  totalRequests: 0,
  requestTimes: [] as number[],
  errors: 0,
  startTime: Date.now(),
};

const trackRequest = async <T>(requestFn: () => Promise<T>): Promise<T> => {
  const startTime = Date.now();
  requestStats.totalRequests++;

  try {
    const result = await requestFn();
    const endTime = Date.now();
    requestStats.requestTimes.push(endTime - startTime);
    return result;
  } catch (error) {
    requestStats.errors++;
    throw error;
  }
};

export const getClientStats = () => {
  const totalTime = requestStats.requestTimes.reduce((a, b) => a + b, 0);
  const avgTime =
    requestStats.requestTimes.length > 0
      ? Math.round(totalTime / requestStats.requestTimes.length)
      : 0;

  return {
    totalRequests: requestStats.totalRequests,
    averageRequestTime: avgTime,
    errors: requestStats.errors,
    uptimeMs: Date.now() - requestStats.startTime,
    slowestRequest:
      requestStats.requestTimes.length > 0 ? Math.max(...requestStats.requestTimes) : 0,
    fastestRequest:
      requestStats.requestTimes.length > 0 ? Math.min(...requestStats.requestTimes) : 0,
  };
};

export const studentsApi = {
  async getAll(filters?: StudentFilters): Promise<Student[]> {
    return trackRequest(async () => {
      let url = `${API_URL}/api/students`;

      // Add query parameters if filters are provided
      if (filters && Object.keys(filters).length > 0) {
        const params = new URLSearchParams();

        if (filters.major) params.append('major', filters.major);
        if (filters.year !== undefined) params.append('year', filters.year.toString());
        if (filters.gpaMin !== undefined) params.append('gpaMin', filters.gpaMin.toString());
        if (filters.gpaMax !== undefined) params.append('gpaMax', filters.gpaMax.toString());

        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const result: ApiResponse<Student[]> = await response.json();
      return result.data || [];
    });
  },

  async getById(id: string): Promise<Student | null> {
    return trackRequest(async () => {
      const response = await fetch(`${API_URL}/api/students/${id}`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch student');
      }
      const result: ApiResponse<Student> = await response.json();
      return result.data || null;
    });
  },

  async create(student: Omit<Student, 'id'>): Promise<Student> {
    return trackRequest(async () => {
      const response = await fetch(`${API_URL}/api/students`, {
        method: 'POST',
        headers: getHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(student),
      });
      if (!response.ok) {
        throw new Error('Failed to create student');
      }
      const result: ApiResponse<Student> = await response.json();
      if (!result.data) throw new Error('No data returned');
      return result.data;
    });
  },

  async update(id: string, updates: Partial<Omit<Student, 'id'>>): Promise<Student> {
    return trackRequest(async () => {
      const response = await fetch(`${API_URL}/api/students/${id}`, {
        method: 'PUT',
        headers: getHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update student');
      }
      const result: ApiResponse<Student> = await response.json();
      if (!result.data) throw new Error('No data returned');
      return result.data;
    });
  },

  async delete(id: string): Promise<void> {
    return trackRequest(async () => {
      const response = await fetch(`${API_URL}/api/students/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
    });
  },

  async getStats(): Promise<any> {
    return trackRequest(async () => {
      const response = await fetch(`${API_URL}/api/stats`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const result = await response.json();
      return result.data;
    });
  },
};
