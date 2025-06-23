export interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  year: number;
  gpa: number;
  phone?: string;
  avatar?: string;
}

export interface StudentFilters {
  major?: string;
  year?: number;
  gpaMin?: number;
  gpaMax?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  filters?: StudentFilters;
}
