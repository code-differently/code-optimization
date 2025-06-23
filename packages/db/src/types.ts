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

export interface DbConfig {
  delays?: {
    create?: number;
    read?: number;
    update?: number;
    delete?: number;
  };
}
