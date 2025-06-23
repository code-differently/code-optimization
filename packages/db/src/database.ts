import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Student, DbConfig } from './types';

export class JsonDatabase {
  private dataFile: string;
  private config: DbConfig;
  private stats: {
    operationCounts: Record<string, number>;
    operationTimes: Record<string, number[]>;
    totalOperations: number;
    startTime: number;
  };

  constructor(dataFile: string = 'data.json', config: DbConfig = {}) {
    this.dataFile = path.resolve(dataFile);
    this.config = {
      delays: {
        create: 2000, // 2 seconds default
        read: 1000, // 1 second default
        update: 2500, // 2.5 seconds default
        delete: 1500, // 1.5 seconds default
        ...config.delays,
      },
    };

    // Initialize performance stats
    this.stats = {
      operationCounts: {},
      operationTimes: {},
      totalOperations: 0,
      startTime: Date.now(),
    };

    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    // Ensure the directory exists
    const dir = path.dirname(this.dataFile);
    await fs.ensureDir(dir);

    if (!(await fs.pathExists(this.dataFile))) {
      const initialData: Student[] = [
        {
          id: uuidv4(),
          name: 'Alex Johnson',
          email: 'alex.johnson@university.edu',
          major: 'Computer Science',
          year: 3,
          gpa: 3.8,
          phone: '555-0101',
          avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff',
        },
        {
          id: uuidv4(),
          name: 'Morgan Smith',
          email: 'morgan.smith@university.edu',
          major: 'Information Systems',
          year: 2,
          gpa: 3.6,
          phone: '555-0102',
          avatar: 'https://ui-avatars.com/api/?name=Morgan+Smith&background=6366F1&color=fff',
        },
        {
          id: uuidv4(),
          name: 'Casey Davis',
          email: 'casey.davis@university.edu',
          major: 'Software Engineering',
          year: 4,
          gpa: 3.9,
          phone: '555-0103',
          avatar: 'https://ui-avatars.com/api/?name=Casey+Davis&background=EF4444&color=fff',
        },
        {
          id: uuidv4(),
          name: 'Jordan Lee',
          email: 'jordan.lee@university.edu',
          major: 'Data Science',
          year: 1,
          gpa: 3.7,
          phone: '555-0104',
          avatar: 'https://ui-avatars.com/api/?name=Jordan+Lee&background=10B981&color=fff',
        },
        {
          id: uuidv4(),
          name: 'Taylor Brown',
          email: 'taylor.brown@university.edu',
          major: 'Cybersecurity',
          year: 3,
          gpa: 3.5,
          phone: '555-0105',
          avatar: 'https://ui-avatars.com/api/?name=Taylor+Brown&background=F59E0B&color=fff',
        },
        {
          id: uuidv4(),
          name: 'Riley Wilson',
          email: 'riley.wilson@university.edu',
          major: 'Computer Science',
          year: 2,
          gpa: 3.4,
          phone: '555-0106',
          avatar: 'https://ui-avatars.com/api/?name=Riley+Wilson&background=8B5CF6&color=fff',
        },
      ];
      await fs.writeJson(this.dataFile, initialData, { spaces: 2 });
    }
  }

  private async delay(operation: keyof NonNullable<DbConfig['delays']>): Promise<void> {
    const delayTime = this.config.delays?.[operation] || 1000;
    return new Promise((resolve) => setTimeout(resolve, delayTime));
  }

  private trackOperation(operation: string, executionTime: number): void {
    this.stats.totalOperations++;
    this.stats.operationCounts[operation] = (this.stats.operationCounts[operation] || 0) + 1;

    if (!this.stats.operationTimes[operation]) {
      this.stats.operationTimes[operation] = [];
    }
    this.stats.operationTimes[operation].push(executionTime);
  }

  private async executeWithTracking<T>(
    operation: string,
    delayType: keyof NonNullable<DbConfig['delays']>,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    await this.delay(delayType);
    const result = await fn();
    const endTime = Date.now();

    this.trackOperation(operation, endTime - startTime);
    return result;
  }

  getStats() {
    const uptimeMs = Date.now() - this.stats.startTime;
    const averageTimes: Record<string, number> = {};

    for (const [operation, times] of Object.entries(this.stats.operationTimes)) {
      averageTimes[operation] =
        times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    }

    return {
      totalOperations: this.stats.totalOperations,
      operationCounts: this.stats.operationCounts,
      averageOperationTimes: averageTimes,
      uptimeMs,
      uptimeSeconds: Math.round(uptimeMs / 1000),
    };
  }

  private async readData(): Promise<Student[]> {
    try {
      return await fs.readJson(this.dataFile);
    } catch (error) {
      console.error('Error reading data:', error);
      return [];
    }
  }

  private async writeData(data: Student[]): Promise<void> {
    await fs.writeJson(this.dataFile, data, { spaces: 2 });
  }

  async findAll(): Promise<Student[]> {
    return this.executeWithTracking('findAll', 'read', () => this.readData());
  }

  async findById(id: string): Promise<Student | null> {
    return this.executeWithTracking('findById', 'read', async () => {
      const data = await this.readData();
      return data.find((student) => student.id === id) || null;
    });
  }

  async create(studentData: Omit<Student, 'id'>): Promise<Student> {
    return this.executeWithTracking('create', 'create', async () => {
      const student: Student = {
        id: uuidv4(),
        ...studentData,
      };
      const data = await this.readData();
      data.push(student);
      await this.writeData(data);
      return student;
    });
  }

  async update(id: string, updates: Partial<Omit<Student, 'id'>>): Promise<Student | null> {
    return this.executeWithTracking('update', 'update', async () => {
      const data = await this.readData();
      const index = data.findIndex((student) => student.id === id);

      if (index === -1) {
        return null;
      }

      data[index] = { ...data[index], ...updates };
      await this.writeData(data);
      return data[index];
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.executeWithTracking('delete', 'delete', async () => {
      const data = await this.readData();
      const index = data.findIndex((student) => student.id === id);

      if (index === -1) {
        return false;
      }

      data.splice(index, 1);
      await this.writeData(data);
      return true;
    });
  }

  // Utility method to configure delays at runtime
  updateConfig(newConfig: DbConfig): void {
    this.config = {
      delays: {
        ...this.config.delays,
        ...newConfig.delays,
      },
    };
  }
}
