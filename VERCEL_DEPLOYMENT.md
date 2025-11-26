# Vercel Deployment Guide

## Architecture

This application consists of two parts:
1. **Frontend** (React + Vite) - Deploy to Vercel
2. **Backend** (Node.js + WebSocket) - Deploy to Render/Railway/Fly.io

Vercel does not support long-lived WebSocket connections, so the backend must be deployed separately.

## Step 1: Deploy Backend

### Option A: Deploy to Render (Recommended)

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: `bevpro-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter

5. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `CONVEX_URL`: Your Convex deployment URL
   - `CONVEX_DEPLOY_KEY`: Your Convex deploy key (if needed)
   - `PORT`: `3000` (default)
   - `NODE_ENV`: `production`

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy the service URL (e.g., `https://bevpro-backend.onrender.com`)

### Option B: Keep Backend on Railway

If Railway is working for your backend, you can keep it there and only move the frontend to Vercel.

1. Keep your backend on Railway as-is
2. Get your Railway backend URL (e.g., `https://your-app.railway.app`)
3. Make sure WebSocket endpoint is accessible

### Option C: Deploy to Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. From the `backend` directory:
   ```bash
   cd backend
   fly launch --no-deploy
   ```
4. Edit `fly.toml` if needed
5. Set secrets:
   ```bash
   fly secrets set GEMINI_API_KEY=your_key
   fly secrets set CONVEX_URL=your_convex_url
   ```
6. Deploy: `fly deploy`
7. Get your app URL: `https://your-app.fly.dev`

## Step 2: Deploy Frontend to Vercel

### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Follow the prompts:
   - Link to existing project or create new one
   - Set the project name (e.g., `bevpro-frontend`)
   - Use detected settings (Vite framework)

6. Set Environment Variable (after initial deployment):
   ```bash
   vercel env add VITE_WS_URL
   ```
   Enter your backend WebSocket URL (e.g., `wss://bevpro-backend.onrender.com`)

7. Redeploy with environment variable:
   ```bash
   vercel --prod
   ```

### Method 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `VITE_WS_URL`: Your backend WebSocket URL (e.g., `wss://bevpro-backend.onrender.com`)
   - `VITE_CONVEX_URL`: Your Convex deployment URL

6. Click "Deploy"

### Method 3: Using Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to Vercel dashboard
3. Click "Import Project"
4. Select your repository
5. Configure as described in Method 2
6. Vercel will auto-deploy on every push to main branch

## Step 3: Configure Backend CORS

Update your backend to allow requests from your Vercel domain.

In `backend/src/server.ts`, update the CORS configuration:

```typescript
app.use('/*', cors({
    origin: (origin) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.FRONTEND_URL,
            'https://your-vercel-app.vercel.app', // Add your Vercel URL
        ].filter(Boolean);
        
        if (!origin) return allowedOrigins[0];
        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            return origin;
        }
        return allowedOrigins[0];
    },
    credentials: true,
}));
```

Then add the environment variable to your backend deployment:
- `FRONTEND_URL`: `https://your-vercel-app.vercel.app`

## Step 4: Test the Deployment

1. Visit your Vercel URL (e.g., `https://bevpro-frontend.vercel.app`)
2. Open browser DevTools Console
3. Check for WebSocket connection logs
4. Test the voice features
5. Verify all functionality works

## Troubleshooting

### WebSocket Connection Failed

- Check that `VITE_WS_URL` is set correctly in Vercel
- Ensure backend is running and accessible
- Verify CORS configuration on backend
- Check browser console for specific errors

### Build Failed on Vercel

- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript types are correct
- Try building locally: `npm run build`

### Environment Variables Not Working

- Environment variables must start with `VITE_` for Vite
- Redeploy after adding/changing environment variables
- Check Vercel dashboard → Settings → Environment Variables

### Backend Connection Issues

- Ensure backend is deployed and running
- Check backend logs for errors
- Verify WebSocket endpoint is accessible
- Test backend health check: `https://your-backend.com/health`

## Deployment URLs

After deployment, update these values:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com` (or Railway/Fly.io URL)
- **WebSocket**: `wss://your-backend.onrender.com`

## Automatic Deployments

### Frontend (Vercel)
- Automatically deploys on every push to main branch
- Preview deployments for pull requests
- Instant rollbacks available

### Backend (Render)
- Automatically deploys on every push to main branch
- Can configure auto-deploy from specific branches
- Health checks and auto-restarts included

## Cost Estimation

### Vercel (Frontend)
- **Hobby Plan**: Free
  - 100 GB bandwidth
  - Unlimited projects
  - Automatic SSL
  
### Render (Backend)
- **Free Tier**: $0/month
  - 750 hours/month
  - Spins down after inactivity
  - 512 MB RAM
  
- **Starter Plan**: $7/month
  - Always on
  - 512 MB RAM
  - Better performance

### Total
- **Free**: $0/month (both services free tier)
- **Recommended**: $7/month (Vercel free + Render Starter)

## Next Steps

1. Deploy backend to Render/Railway/Fly.io
2. Note the backend URL
3. Deploy frontend to Vercel with backend URL
4. Test thoroughly
5. Set up custom domain (optional)
6. Configure monitoring and alerts
