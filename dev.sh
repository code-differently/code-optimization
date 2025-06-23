#!/bin/bash

# Start development environment for the code optimization demo

echo "🚀 Starting Code Optimization Demo Environment"
echo "=============================================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first: npm install -g pnpm"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

echo "🏗️  Building database package..."
pnpm --filter db run build

echo "🌐 Starting all services..."
echo ""
echo "Services will be available at:"
echo "  📱 Frontend: http://localhost:3000"
echo "  🔌 API:      http://localhost:3001"
echo "  ❤️  Health:   http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start all services in development mode
pnpm dev
