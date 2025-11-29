#!/bin/bash

# Railway Backend Deployment Script for BevPro Voice POS

set -e

echo "🚂 BevPro Voice POS - Railway Backend Deployment"
echo "================================================="
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo ""
fi

echo "✅ Railway CLI found"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-Deployment Checklist:"
echo "============================"
echo ""
echo "Before deploying, ensure you have:"
echo "  1. ✓ Railway account created (https://railway.app)"
echo "  2. ✓ Google Gemini API Key ready"
echo "  3. ✓ Convex deployment URL (default: https://impartial-orca-713.convex.cloud)"
echo ""

read -p "Have you completed the checklist above? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please complete the checklist first"
    echo ""
    echo "Get your Gemini API key: https://ai.google.dev/"
    echo "Create Railway account: https://railway.app"
    exit 1
fi

echo ""
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway:"
    railway login
fi

echo ""
echo "✅ Logged in to Railway"
echo ""

# Change to backend directory
cd backend

echo "🚀 Initializing Railway project..."
echo ""

# Initialize Railway project
if [ ! -f "railway.json" ]; then
    echo "❌ railway.json not found in backend directory"
    exit 1
fi

railway init

echo ""
echo "📝 Please provide the following information:"
echo ""

# Get Gemini API Key
read -p "Enter your Google Gemini API Key: " GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Gemini API Key is required"
    exit 1
fi

# Get Convex URL
read -p "Enter your Convex URL (press Enter for default: https://impartial-orca-713.convex.cloud): " CONVEX_URL
if [ -z "$CONVEX_URL" ]; then
    CONVEX_URL="https://impartial-orca-713.convex.cloud"
fi

echo ""
echo "🔧 Setting environment variables..."
railway variables set GEMINI_API_KEY="$GEMINI_API_KEY"
railway variables set CONVEX_URL="$CONVEX_URL"
railway variables set NODE_ENV="production"

echo ""
echo "✅ Environment variables set"
echo ""

echo "📦 Deploying to Railway..."
echo ""

railway up

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

echo "🌐 Getting your backend URL..."
echo ""

# Get the domain
BACKEND_URL=$(railway domain 2>&1)

echo ""
echo "🎉 Backend Deployed Successfully!"
echo "=================================="
echo ""
echo "Your backend is running at:"
echo "  HTTP: https://$BACKEND_URL"
echo "  WebSocket: wss://$BACKEND_URL"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Test your backend health check:"
echo "   curl https://$BACKEND_URL/health"
echo ""
echo "2. Set the VITE_WS_URL environment variable in Vercel:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select your project: newbev1124"
echo "   - Go to Settings → Environment Variables"
echo "   - Add new variable:"
echo "     Name: VITE_WS_URL"
echo "     Value: wss://$BACKEND_URL"
echo "     Environments: Production, Preview, Development"
echo "   - Save and redeploy"
echo ""
echo "3. Your frontend will automatically reconnect to the backend!"
echo ""
echo "📚 Deployment Logs:"
echo "   railway logs"
echo ""
echo "🔧 Update Environment Variables:"
echo "   railway variables"
echo ""
echo "📊 View Dashboard:"
echo "   railway open"
echo ""
