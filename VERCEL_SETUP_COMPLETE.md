# Vercel Deployment Setup Complete

## Changes Made

### 1. Frontend Configuration

- Created `/frontend/vercel.json` with Vite framework configuration
- Updated `/frontend/.gitignore` to exclude `convex/_generated/`
- Updated `/frontend/.env.example` with environment variables for deployment
- Modified `/frontend/package.json` to include prebuild script for Convex files
- Updated `main.tsx` to use `VITE_CONVEX_URL` environment variable

### 2. Import Path Updates

All frontend files now import from local Convex generated files instead of backend:
- `../../../backend/convex/_generated/api` → `../../convex/_generated/api`
- `../../../../backend/convex/_generated/api` → `../../../convex/_generated/api`

Updated files:
- `src/screens/TransactionsScreen.tsx`
- `src/screens/SavedOrdersScreen.tsx`
- `src/screens/ProductsScreen.tsx`
- `src/screens/ItemsScreen.tsx`
- `src/screens/SettingsScreen.tsx`
- `src/components/products/ProductCard.tsx`
- `src/components/cart/CartItem.tsx`
- `src/components/cart/CartPanel.tsx`

### 3. TypeScript Configuration

- Updated `tsconfig.json` to exclude backend files
- Fixed type errors in ItemsScreen and SettingsScreen
- Build now completes successfully

### 4. Backend Deployment Files

Created deployment configurations:
- `/backend/render.yaml` - Render.com configuration
- `/backend/Dockerfile` - Docker configuration
- `/backend/.dockerignore` - Docker ignore rules

### 5. Documentation

- Created `/VERCEL_DEPLOYMENT.md` with comprehensive deployment guide
- Updated `/README.md` to include Vercel deployment option
- Created `/.vercelignore` to exclude backend from Vercel deployment

## Deployment Steps

### Quick Start

```bash
# 1. Deploy Backend (choose one platform)

## Option A: Render.com (Recommended)
- Visit https://render.com
- Create new Web Service from Git repository
- Root Directory: backend
- Build Command: npm install && npm run build
- Start Command: npm start
- Add environment variables (GEMINI_API_KEY, CONVEX_URL, etc.)

## Option B: Keep on Railway
- Your backend can stay on Railway if it's working
- Just get the URL for frontend configuration

## Option C: Fly.io
- Run: cd backend && fly launch
- Set secrets with: fly secrets set GEMINI_API_KEY=...

# 2. Deploy Frontend to Vercel

cd frontend

# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_WS_URL
# Enter: wss://your-backend-url.com

vercel env add VITE_CONVEX_URL
# Enter: https://impartial-orca-713.convex.cloud

# Deploy to production
vercel --prod
```

### Using Vercel Dashboard

1. Go to https://vercel.com
2. Import your Git repository
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variables:
   - `VITE_WS_URL`: Your backend WebSocket URL (e.g., `wss://bevpro-backend.onrender.com`)
   - `VITE_CONVEX_URL`: Your Convex deployment URL
5. Deploy

## Environment Variables

### Frontend (Vercel)
- `VITE_WS_URL`: WebSocket URL for backend connection (e.g., `wss://your-backend.com`)
- `VITE_CONVEX_URL`: Convex deployment URL (e.g., `https://impartial-orca-713.convex.cloud`)

### Backend (Render/Railway/Fly.io)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `CONVEX_URL`: Your Convex deployment URL
- `CONVEX_DEPLOY_KEY`: Convex deploy key (if needed)
- `NODE_ENV`: `production`
- `PORT`: `3000` (or auto-assigned by platform)
- `FRONTEND_URL`: Your Vercel frontend URL (for CORS)
- `VENUE_NAME`: Your venue name
- `VENUE_ID`: Your venue ID

## Verification

### Check Frontend Build
```bash
cd frontend
npm run build
```
✅ Build completes successfully

### Test Locally
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### After Deployment
1. Visit your Vercel URL
2. Open browser DevTools Console
3. Look for WebSocket connection messages
4. Test voice features
5. Verify all functionality works

## Troubleshooting

### Build Fails on Vercel
- Check that `prebuild` script runs successfully
- Verify Convex generated files are being copied
- Check build logs for specific errors

### WebSocket Connection Failed
- Verify `VITE_WS_URL` is set correctly in Vercel
- Ensure backend is running and accessible
- Check backend CORS configuration
- Verify backend allows WebSocket connections

### Environment Variables Not Working
- Environment variables must start with `VITE_` for Vite
- Redeploy after adding/changing environment variables
- Check Vercel dashboard → Settings → Environment Variables

## Cost Estimate

- **Vercel Frontend**: Free (Hobby plan)
- **Render Backend**: Free or $7/month (Starter recommended)
- **Total**: $0-$7/month

## Architecture

```
┌─────────────┐      HTTPS/WSS      ┌──────────────┐
│   Browser   │ ◄─────────────────► │   Vercel     │
│             │                      │  (Frontend)  │
└─────────────┘                      └──────────────┘
                                            │
                                            │ WebSocket
                                            ▼
                                     ┌──────────────┐
                                     │   Render     │
                                     │  (Backend)   │
                                     │  + WebSocket │
                                     └──────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │    Convex    │
                                     │  (Database)  │
                                     └──────────────┘
```

## Next Steps

1. Deploy backend to Render/Railway/Fly.io
2. Note the backend URL (e.g., `https://your-backend.onrender.com`)
3. Deploy frontend to Vercel with backend URL
4. Test thoroughly
5. Set up custom domain (optional)
6. Configure monitoring and alerts

## Support

For issues:
1. Check build logs in Vercel dashboard
2. Check runtime logs in backend platform
3. Review browser console for frontend errors
4. Check network tab for API/WebSocket issues

## Success Indicators

✅ Frontend builds without errors
✅ Frontend deploys to Vercel successfully  
✅ Backend deploys to chosen platform
✅ WebSocket connection establishes
✅ Voice features work correctly
✅ Cart and orders sync properly
✅ All UI features functional

Your application is now ready for Vercel deployment!
