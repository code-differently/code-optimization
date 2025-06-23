# Code Optimization Demo

A PNPM monorepo demonstrating performance optimization opportunities in a three-tier architecture. This project is designed for educational purposes to teach students how to identify and optimize performance bottlenecks.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │       API       │    │    Database     │
│   (Next.js)     │◄──►│   (Express)     │◄──►│  (JSON Files)   │
│  Port: 3000     │    │  Port: 3001     │    │  Configurable   │
│                 │    │                 │    │    Delays       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Packages

### 🗄️ `packages/db`

- JSON-based database client with configurable delays
- CRUD operations for student data
- Simulates real database latency (1-3 seconds per operation)
- Configurable timing per operation type

### 🚀 `packages/api`

- Express.js REST API
- Business logic layer
- CORS enabled for frontend communication
- Health check endpoint

### 🌐 `packages/web-fe`

- Next.js 14 application
- Tailwind CSS for styling
- Student directory interface
- Performance bottleneck demonstrations

## Quick Start

### Prerequisites

- Node.js 18+
- PNPM 8+

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start all services in development mode:

   **Option 1: Local development**
   ```bash
   pnpm dev
   # or
   ./scripts/dev.sh
   ```

   **Option 2: Network access (for sharing with students)**
   ```bash
   pnpm dev:network
   # or
   ./scripts/dev-network.sh
   ```

   **Option 3: Cloud deployment (persistent access)**
   ```bash
   pnpm deploy
   # or
   ./scripts/deploy.sh
   ```

   Or start services individually:

   ```bash
   # Database (builds TypeScript)
   pnpm db:dev

   # API server
   pnpm api:dev

   # Frontend
   pnpm web:dev
   ```

4. Open your browser to:
   - Frontend: http://localhost:3000
   - API Health Check: http://localhost:3001/health
   - API Documentation: http://localhost:3001/api/students

## Performance Bottlenecks (Intentional)

This application intentionally includes several performance issues for educational purposes:

### Database Layer

- ❌ **Slow operations**: Each CRUD operation takes 1-3 seconds
- ❌ **No connection pooling**: Each request creates new file operations
- ❌ **No indexing**: Linear search through JSON arrays
- ❌ **No query optimization**: Always loads full dataset

### API Layer

- ❌ **No caching**: Every request hits the database
- ❌ **No pagination**: Returns all records at once
- ❌ **Sequential operations**: No parallel processing
- ❌ **No rate limiting**: Unlimited concurrent requests

### Frontend Layer

- ❌ **No client-side caching**: Each navigation refetches data
- ❌ **No loading states optimization**: Poor UX during delays
- ❌ **No virtual scrolling**: Renders all items at once
- ❌ **No request deduplication**: Multiple simultaneous requests possible

## Configuration

### Database Delays

You can configure database operation delays via environment variables:

```bash
# API package .env
DB_CREATE_DELAY=2000  # 2 seconds
DB_READ_DELAY=1000    # 1 second
DB_UPDATE_DELAY=2500  # 2.5 seconds
DB_DELETE_DELAY=1500  # 1.5 seconds
```

Or via the API endpoint:

```bash
curl -X POST http://localhost:3001/api/config/delays \
  -H "Content-Type: application/json" \
  -d '{"delays": {"read": 500, "create": 1000}}'
```

## Sample Data

The database is pre-populated with 6 computer science students including:

- Names, emails, majors
- Academic year and GPA
- Contact information
- Generated avatars

## Learning Objectives

Students will learn to:

1. **Identify bottlenecks** using browser dev tools
2. **Implement caching** at multiple layers
3. **Optimize database queries** and operations
4. **Add pagination** and virtual scrolling
5. **Implement parallel processing**
6. **Add loading states** and optimistic updates
7. **Monitor performance** with metrics

## Common Optimization Techniques to Implement

1. **Database Layer**
   - Add in-memory caching
   - Implement query optimization
   - Add database indexing simulation
   - Connection pooling

2. **API Layer**
   - Redis caching
   - Response compression
   - Pagination
   - Parallel query execution
   - GraphQL for efficient data fetching

3. **Frontend Layer**
   - React Query/SWR for caching
   - Virtual scrolling
   - Code splitting
   - Image optimization
   - Service workers

## API Endpoints

```
GET    /health              - Health check
GET    /api/students        - Get all students
GET    /api/students/:id    - Get student by ID
POST   /api/students        - Create new student
PUT    /api/students/:id    - Update student
DELETE /api/students/:id    - Delete student
POST   /api/config/delays   - Update database delays
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Development mode (local only)
pnpm dev

# Development mode (accessible on network)
pnpm dev:network

# Deploy to cloud (Vercel)
pnpm deploy

# Legacy: Development mode (all packages)
pnpm dev:all

# Build all packages
pnpm build

# Clean all build artifacts
pnpm clean

# Individual package commands
pnpm --filter db run build
pnpm --filter api run dev
pnpm --filter web-fe run build
```

## Scripts Directory

All development and deployment scripts are located in `scripts/`:

- `scripts/dev.sh` - Standard local development
- `scripts/dev-network.sh` - Network-accessible development (for classrooms)
- `scripts/deploy.sh` - Quick cloud deployment to Vercel

## Sharing with Students

### For Live Lectures:
1. **ngrok (Recommended)**: Install ngrok, run `pnpm dev`, then `ngrok http 3000`
2. **Network Mode**: Run `pnpm dev:network` and share the local IP URL
3. **Cloud Deploy**: Run `pnpm deploy` for persistent access

### For Async Learning:
Use `pnpm deploy` to create a permanent URL students can access anytime.

## Tech Stack

- **Package Manager**: PNPM
- **Database**: JSON files with fs-extra
- **API**: Express.js + TypeScript
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Icons**: Lucide React
- **Build**: TypeScript compiler

## License

MIT - Educational use encouraged!
