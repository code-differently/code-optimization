#!/bin/bash

# Quick deploy to Vercel for persistent student access

echo "☁️  Quick Deploy to Vercel"
echo "=========================="
echo "This will deploy your demo to a permanent URL students can access anytime"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🏗️  Building and deploying frontend..."
cd packages/web-fe

# Deploy to Vercel
vercel --yes

echo ""
echo "✅ Deployment complete!"
echo "📱 Students can access your demo at the URL shown above"
echo "🔄 To update: run this script again or use 'vercel' in packages/web-fe/"
