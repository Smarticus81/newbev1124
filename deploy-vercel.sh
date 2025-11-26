#!/bin/bash

# Vercel Deployment Script for BevPro Voice POS

set -e

echo "🚀 BevPro Voice POS - Vercel Deployment"
echo "========================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI found"
echo ""

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Deployment Checklist:"
echo "========================"
echo ""
echo "Before deploying, ensure you have:"
echo "  1. ✓ Backend deployed and running (Render/Railway/Fly.io)"
echo "  2. ✓ Backend URL ready (e.g., https://your-backend.onrender.com)"
echo "  3. ✓ Convex deployment URL"
echo "  4. ✓ WebSocket URL (usually same as backend with wss://)"
echo ""

read -p "Have you completed the checklist above? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please complete the checklist first"
    echo ""
    echo "📚 See VERCEL_DEPLOYMENT.md for full deployment guide"
    exit 1
fi

echo ""
echo "📝 Please provide the following information:"
echo ""

# Get backend URL
read -p "Enter your backend WebSocket URL (e.g., wss://your-backend.onrender.com): " BACKEND_WS_URL
if [ -z "$BACKEND_WS_URL" ]; then
    echo "❌ Backend URL is required"
    exit 1
fi

# Get Convex URL
read -p "Enter your Convex URL (press Enter for default: https://impartial-orca-713.convex.cloud): " CONVEX_URL
if [ -z "$CONVEX_URL" ]; then
    CONVEX_URL="https://impartial-orca-713.convex.cloud"
fi

echo ""
echo "🔧 Configuration:"
echo "  Backend WebSocket: $BACKEND_WS_URL"
echo "  Convex URL: $CONVEX_URL"
echo ""

read -p "Is this correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Change to frontend directory
cd frontend

echo ""
echo "🏗️  Building frontend..."
echo ""

# Build the frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build successful"
echo ""

# Check if already logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

echo ""
echo "📤 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --yes

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

# Add environment variables
echo "🔧 Setting environment variables..."
echo ""

echo "$BACKEND_WS_URL" | vercel env add VITE_WS_URL production
echo "$CONVEX_URL" | vercel env add VITE_CONVEX_URL production

echo ""
echo "🚀 Deploying to production with environment variables..."
echo ""

vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Production deployment failed"
    exit 1
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "Your application is now live on Vercel!"
echo ""
echo "Next steps:"
echo "  1. Visit your Vercel dashboard to see the deployment URL"
echo "  2. Test the voice features"
echo "  3. Update your backend CORS settings with the Vercel URL"
echo "  4. Set up a custom domain (optional)"
echo ""
echo "📚 For troubleshooting, see VERCEL_DEPLOYMENT.md"
echo ""
