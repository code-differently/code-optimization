import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Student, DbConfig, StudentFilters } from './types';

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
      const initialData: Student[] = this.generateStudentData();
      await fs.writeJson(this.dataFile, initialData, { spaces: 2 });
    }
  }

  private generateStudentData(): Student[] {
    const firstNames = [
      'Alex',
      'Morgan',
      'Casey',
      'Jordan',
      'Taylor',
      'Riley',
      'Avery',
      'Quinn',
      'Cameron',
      'Blake',
      'Sam',
      'Devon',
      'Emerson',
      'Finley',
      'Harper',
      'Hayden',
      'Jamie',
      'Kai',
      'Logan',
      'Parker',
      'Peyton',
      'Reese',
      'River',
      'Rowan',
      'Sage',
      'Skyler',
      'Sydney',
      'Tatum',
      'Phoenix',
      'Remy',
      'Dakota',
      'Elliot',
      'Eden',
      'Indigo',
      'Lane',
      'Nova',
      'Oakley',
      'Raven',
      'Scout',
      'Wren',
      'Ari',
      'Ash',
      'Bay',
      'Beau',
      'Briar',
      'Charlie',
      'Drew',
      'Ellis',
      'Frankie',
      'Gray',
    ];

    const lastNames = [
      'Johnson',
      'Smith',
      'Davis',
      'Lee',
      'Brown',
      'Wilson',
      'Martinez',
      'Anderson',
      'Taylor',
      'Thomas',
      'Jackson',
      'White',
      'Harris',
      'Martin',
      'Garcia',
      'Rodriguez',
      'Lewis',
      'Walker',
      'Hall',
      'Allen',
      'Young',
      'King',
      'Wright',
      'Lopez',
      'Hill',
      'Scott',
      'Green',
      'Adams',
      'Baker',
      'Gonzalez',
      'Nelson',
      'Carter',
      'Mitchell',
      'Perez',
      'Roberts',
      'Turner',
      'Phillips',
      'Campbell',
      'Parker',
      'Evans',
      'Edwards',
      'Collins',
      'Stewart',
      'Sanchez',
      'Morris',
      'Rogers',
      'Reed',
      'Cook',
      'Morgan',
      'Bell',
    ];

    const majors = [
      'Computer Science',
      'Software Engineering',
      'Information Systems',
      'Data Science',
      'Cybersecurity',
      'Computer Engineering',
      'Information Technology',
      'Web Development',
      'Artificial Intelligence',
      'Machine Learning',
      'Game Development',
      'Mobile Development',
      'Network Engineering',
      'Database Administration',
      'UI/UX Design',
      'Digital Marketing',
    ];

    const colors = [
      '0D8ABC',
      '6366F1',
      'EF4444',
      '10B981',
      'F59E0B',
      '8B5CF6',
      'EC4899',
      '06B6D4',
      'F97316',
      '84CC16',
      '3B82F6',
      'EAB308',
      'DC2626',
      '059669',
      '7C3AED',
      'DB2777',
    ];

    const students: Student[] = [];

    for (let i = 0; i < 1000; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`;
      const major = majors[Math.floor(Math.random() * majors.length)];
      const year = Math.floor(Math.random() * 4) + 1; // 1-4
      const gpa = Math.round((Math.random() * 2 + 2.5) * 100) / 100; // 2.5-4.5, rounded to 2 decimals
      const phone = `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff`;

      students.push({
        id: uuidv4(),
        name,
        email,
        major,
        year,
        gpa,
        phone,
        avatar,
      });
    }

    return students;
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

  async findWithFilters(filters: StudentFilters): Promise<Student[]> {
    return this.executeWithTracking('findWithFilters', 'read', async () => {
      const data = await this.readData();

      return data.filter((student) => {
        // Filter by major (exact match, case-insensitive)
        if (filters.major && student.major.toLowerCase() !== filters.major.toLowerCase()) {
          return false;
        }

        // Filter by year (exact match)
        if (filters.year !== undefined && student.year !== filters.year) {
          return false;
        }

        // Filter by GPA range
        if (filters.gpaMin !== undefined && student.gpa < filters.gpaMin) {
          return false;
        }

        if (filters.gpaMax !== undefined && student.gpa > filters.gpaMax) {
          return false;
        }

        return true;
      });
    });
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
