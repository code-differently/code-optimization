import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { JsonDatabase, StudentFilters } from '@code-optimization/db';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database with configurable delays
// Use a path that works both in development and production
const dataDir =
  process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../data')
    : path.join(process.cwd(), 'data');

const db = new JsonDatabase(path.join(dataDir, 'students.json'), {
  delays: {
    create: parseInt(process.env.DB_CREATE_DELAY || '2000'),
    read: parseInt(process.env.DB_READ_DELAY || '1000'),
    update: parseInt(process.env.DB_UPDATE_DELAY || '2500'),
    delete: parseInt(process.env.DB_DELETE_DELAY || '1500'),
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all students with optional filtering
app.get('/api/students', async (req, res) => {
  try {
    const { major, year, gpaMin, gpaMax } = req.query;

    // Build filters object
    const filters: StudentFilters = {};

    if (major && typeof major === 'string') {
      filters.major = major;
    }

    if (year && typeof year === 'string') {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        filters.year = yearNum;
      }
    }

    if (gpaMin && typeof gpaMin === 'string') {
      const gpaMinNum = parseFloat(gpaMin);
      if (!isNaN(gpaMinNum)) {
        filters.gpaMin = gpaMinNum;
      }
    }

    if (gpaMax && typeof gpaMax === 'string') {
      const gpaMaxNum = parseFloat(gpaMax);
      if (!isNaN(gpaMaxNum)) {
        filters.gpaMax = gpaMaxNum;
      }
    }

    // Use filtered search if any filters are provided, otherwise get all
    const students =
      Object.keys(filters).length > 0 ? await db.findWithFilters(filters) : await db.findAll();

    res.json({
      success: true,
      data: students,
      count: students.length,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students',
    });
  }
});

// Get student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await db.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }
    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student',
    });
  }
});

// Create new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, email, major, year, gpa, phone } = req.body;

    // Basic validation
    if (!name || !email || !major || !year || gpa === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, major, year, gpa',
      });
    }

    const student = await db.create({
      name,
      email,
      major,
      year,
      gpa,
      phone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=0D8ABC&color=fff`,
    });

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create student',
    });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const updates = req.body;
    const student = await db.update(req.params.id, updates);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student',
    });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deleted = await db.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete student',
    });
  }
});

// Configuration endpoint to update database delays
app.post('/api/config/delays', (req, res) => {
  try {
    const { delays } = req.body;
    db.updateConfig({ delays });
    res.json({
      success: true,
      message: 'Database delays updated',
      delays,
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration',
    });
  }
});

// Performance stats endpoint
app.get('/api/stats', (req, res) => {
  try {
    const dbStats = db.getStats();
    const processStats = process.memoryUsage();

    res.json({
      success: true,
      data: {
        database: dbStats,
        server: {
          memoryUsage: {
            rss: Math.round(processStats.rss / 1024 / 1024), // MB
            heapUsed: Math.round(processStats.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(processStats.heapTotal / 1024 / 1024), // MB
          },
          uptime: Math.round(process.uptime()),
          nodeVersion: process.version,
          platform: process.platform,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance stats',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Students API: http://localhost:${PORT}/api/students`);
});
