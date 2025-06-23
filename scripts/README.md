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

### 🚇 `dev-ngrok.sh`
**Universal remote access with ngrok**
- Creates ngrok tunnels for both API and frontend
- Automatically configures frontend to use tunneled API
- Perfect for remote students anywhere in the world
- Requires ngrok account and setup (free tier available)

Usage:
```bash
./scripts/dev-ngrok.sh
# or
pnpm dev:ngrok
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
1. **Best for Universal Access**: Use ngrok for students anywhere
   ```bash
   pnpm dev:ngrok
   ```

2. **Alternative for Same Network**: Use network mode for same-network access
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
