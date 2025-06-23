#!/bin/bash

# Start development environment with ngrok tunnels for remote student access

echo "🌐 Starting Code Optimization Demo - ngrok Mode"
echo "==============================================="
echo "This will create public tunnels for both API and frontend"
echo "Perfect for sharing with remote students!"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed."
    echo "📦 Please install ngrok:"
    echo "   - Visit https://ngrok.com/ and sign up"
    echo "   - Install via: brew install ngrok"
    echo "   - Or download from https://ngrok.com/download"
    echo "   - Then run: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

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
echo "Starting services..."
echo "==================="

# Start API server in background
echo "🚀 Starting API server on port 3001..."
cd packages/api && npm run dev &
API_PID=$!

# Wait for API to start
echo "⏳ Waiting for API server to start..."
sleep 3

# Create ngrok configuration file for multiple tunnels
echo "📝 Creating ngrok configuration..."
NGROK_CONFIG_FILE="ngrok-config.yml"

# Get auth token from existing ngrok config
NGROK_AUTH_TOKEN=""
if [ -f "$HOME/Library/Application Support/ngrok/ngrok.yml" ]; then
    NGROK_AUTH_TOKEN=$(grep "authtoken:" "$HOME/Library/Application Support/ngrok/ngrok.yml" | sed 's/authtoken: //' | tr -d ' ')
fi

if [ -z "$NGROK_AUTH_TOKEN" ]; then
    echo "❌ Could not find ngrok auth token."
    echo "📦 Please run: ngrok config add-authtoken YOUR_TOKEN"
    echo "   Get your token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
fi

cat > $NGROK_CONFIG_FILE << EOF
version: "2"
authtoken: $NGROK_AUTH_TOKEN
tunnels:
  api:
    proto: http
    addr: 3001
  frontend:
    proto: http
    addr: 3000
EOF

# Start ngrok with both tunnels
echo "🌐 Creating ngrok tunnels for both API and frontend..."
ngrok start --all --config=$NGROK_CONFIG_FILE --log=stdout > ngrok.log &
NGROK_PID=$!

# Wait for ngrok to start
echo "⏳ Waiting for ngrok tunnels to start..."
sleep 5

# Extract URLs from ngrok logs
API_URL=$(grep -A 10 "api.*started" ngrok.log | grep -o 'https://[^[:space:]]*\.ngrok-free\.app' | head -1)
FRONTEND_URL=$(grep -A 10 "frontend.*started" ngrok.log | grep -o 'https://[^[:space:]]*\.ngrok-free\.app' | head -1)

# Alternative method if the above doesn't work
if [ -z "$API_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo "⏳ Trying alternative URL extraction method..."
    sleep 2
    
    # Extract all https URLs and assign them
    URLS=($(grep -o 'https://[^[:space:]]*\.ngrok-free\.app' ngrok.log | sort | uniq))
    
    if [ ${#URLS[@]} -ge 2 ]; then
        API_URL=${URLS[0]}
        FRONTEND_URL=${URLS[1]}
    fi
fi

if [ -z "$API_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo "❌ Failed to get ngrok URLs. Check your ngrok configuration."
    echo "📋 Debug info - ngrok log:"
    tail -20 ngrok.log
    kill $API_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ API tunnel created: $API_URL"
echo "✅ Frontend tunnel created: $FRONTEND_URL"

# Create .env.local for frontend with the ngrok API URL
cd ../web-fe
echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.local
echo "📝 Created .env.local with API URL: $API_URL"

# Start frontend server in background
echo "🚀 Starting frontend server on port 3000..."
npm run web:dev &
FRONTEND_PID=$!

echo ""
echo "🎉 All services started successfully!"
echo "====================================="
echo ""
echo "📚 Share this URL with your students:"
echo "🌐 Frontend: $FRONTEND_URL"
echo ""
echo "🔧 Technical Details:"
echo "   • API Tunnel:      $API_URL"
echo "   • Frontend Tunnel: $FRONTEND_URL"
echo "   • Local API:       http://localhost:3001"
echo "   • Local Frontend:  http://localhost:3000"
echo ""
echo "✨ Students can access your live demo from anywhere!"
echo "🔄 Code changes will be reflected in real-time"
echo ""
echo "Press Ctrl+C to stop all services and tunnels"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services and tunnels..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    
    # Clean up log files and config
    rm -f packages/ngrok.log packages/ngrok-config.yml
    
    # Remove the temporary .env.local
    rm -f packages/web-fe/.env.local
    
    echo "✅ Cleanup complete"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT

# Wait for all background processes
wait
