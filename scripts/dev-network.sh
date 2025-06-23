#!/bin/bash

# Start development environment for network access (lecture mode)

echo "🌐 Starting Code Optimization Demo - Network Mode"
echo "================================================"
echo "This will make your dev server accessible to students on the same network"
echo ""

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
pnpm --filter=@code-optimization/db run build

echo ""
echo "Starting services for network access..."
echo "======================================="

# Function to get local IP
get_local_ip() {
    local ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
    echo $ip
}

LOCAL_IP=$(get_local_ip)

echo "🗄️  Database will be accessible internally"
echo "🖥️  API Server will start on: http://${LOCAL_IP}:3001"
echo "🌐 Web Frontend will start on: http://${LOCAL_IP}:3000"
echo ""
echo "📚 Share this URL with your students: http://${LOCAL_IP}:3000"
echo ""

# Start API server in background (with network access)
echo "Starting API server..."
cd packages/api && npm run dev &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Start frontend server (with network access)
echo "Starting frontend server..."
cd ../web-fe && npm run dev:network &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo "📱 Students can access your demo at: http://${LOCAL_IP}:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT

# Wait for all background processes
wait
