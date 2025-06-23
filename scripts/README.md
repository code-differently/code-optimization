# Scripts Directory

This directory contains utility scripts for development and deployment.

## Available Scripts

### 🛠️ `dev.sh`
**Standard local development**
- Starts all services (db, api, web-fe)
- Services accessible only on localhost
- Perfect for solo development

Usage:
```bash
./scripts/dev.sh
# or
pnpm dev
```

### 🌐 `dev-network.sh`
**Network-accessible development**
- Starts all services with network access
- Makes your dev server accessible to other devices on the same network
- Perfect for classroom/workshop scenarios
- Shows local IP address for sharing

Usage:
```bash
./scripts/dev-network.sh
# or
pnpm dev:network
```

### ☁️ `deploy.sh`
**Quick cloud deployment**
- Deploys the frontend to Vercel
- Creates a permanent, shareable URL
- Perfect for persistent student access
- Requires Vercel CLI (installs automatically)

Usage:
```bash
./scripts/deploy.sh
# or
pnpm deploy
```

## For Teaching Scenarios

### Live Lectures (Real-time Demo)
1. **Best**: Use ngrok for universal access
   ```bash
   pnpm dev
   ngrok http 3000  # in another terminal
   ```

2. **Alternative**: Use network mode for same-network access
   ```bash
   pnpm dev:network
   ```

### Async Learning (Persistent Access)
```bash
pnpm deploy
```

## Prerequisites

- Node.js 18+
- PNPM 8+
- For cloud deployment: Vercel account (free)
- For ngrok: ngrok account (free tier available)

All scripts are designed to be idempotent and handle dependency installation automatically.
