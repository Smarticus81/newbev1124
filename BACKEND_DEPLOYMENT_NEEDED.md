# ⚠️ Backend Deployment Required

## Current Status

✅ **Frontend Deployed**: https://newbev1124-neko91q1b-smarticus81s-projects.vercel.app
❌ **Backend Not Deployed**: WebSocket server is not running

## The Issue

Your frontend is trying to connect to `wss://newbev1124-neko91q1b-smarticus81s-projects.vercel.app` for WebSocket, but:
- Vercel **does not support** long-lived WebSocket connections
- The backend must be deployed to a **separate service**
- The frontend needs the `VITE_WS_URL` environment variable set

## Solution: Deploy Backend to Railway

Railway is the fastest and easiest option for deploying your Node.js + WebSocket backend.

### Option 1: Railway (Recommended - Easiest)

**Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
```

**Step 2: Login to Railway**
```bash
railway login
```

**Step 3: Deploy Backend**
```bash
cd backend
railway init
railway up
```

**Step 4: Add Environment Variables**
```bash
railway variables set GEMINI_API_KEY="your-gemini-api-key"
railway variables set CONVEX_URL="https://impartial-orca-713.convex.cloud"
railway variables set NODE_ENV="production"
```

**Step 5: Get Your Backend URL**
```bash
railway domain
```
This will give you a URL like: `https://your-app.up.railway.app`

**Step 6: Set Vercel Environment Variable**

Go to your Vercel dashboard:
1. Navigate to your project settings
2. Go to "Environment Variables"
3. Add a new variable:
   - **Name**: `VITE_WS_URL`
   - **Value**: `wss://your-app.up.railway.app` (use the URL from step 5, but replace `https://` with `wss://`)
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy your frontend (Vercel will auto-redeploy or you can trigger manually)

---

### Option 2: Render (Alternative)

**Step 1: Go to [render.com](https://render.com)**

**Step 2: Create New Web Service**
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the repository: `Smarticus81/newbev1124`

**Step 3: Configure Service**
- **Name**: `newbev1124-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: Free (or Starter for $7/month - always on)

**Step 4: Add Environment Variables**
- `GEMINI_API_KEY`: Your Google Gemini API key
- `CONVEX_URL`: `https://impartial-orca-713.convex.cloud`
- `NODE_ENV`: `production`
- `PORT`: `3000`

**Step 5: Deploy**
- Click "Create Web Service"
- Wait for deployment (3-5 minutes)
- Copy the service URL (e.g., `https://newbev1124-backend.onrender.com`)

**Step 6: Set Vercel Environment Variable**
- Same as Railway Option, Step 6 above
- Use `wss://newbev1124-backend.onrender.com` as the value

---

### Option 3: Fly.io (Advanced)

**Step 1: Install Fly CLI**
```bash
curl -L https://fly.io/install.sh | sh
```

**Step 2: Login**
```bash
fly auth login
```

**Step 3: Launch App**
```bash
cd backend
fly launch --no-deploy
```

**Step 4: Set Secrets**
```bash
fly secrets set GEMINI_API_KEY="your-key"
fly secrets set CONVEX_URL="https://impartial-orca-713.convex.cloud"
fly secrets set NODE_ENV="production"
```

**Step 5: Deploy**
```bash
fly deploy
```

**Step 6: Get URL**
```bash
fly status
```

**Step 7: Set Vercel Environment Variable**
- Same as above, using your Fly.io URL

---

## Quick Checklist

Once you've deployed the backend:

- [ ] Backend is deployed and accessible
- [ ] Backend WebSocket endpoint works (test with `wscat -c wss://your-backend-url`)
- [ ] `VITE_WS_URL` environment variable is set in Vercel
- [ ] Frontend is redeployed (Vercel auto-redeploys when env vars change)
- [ ] Test the frontend - WebSocket should connect successfully
- [ ] Voice features work end-to-end

## Cost Estimates

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Railway** | $5 credit/month | $5+ usage-based |
| **Render** | 750 hrs/month (sleeps) | $7/month (always on) |
| **Fly.io** | Limited free tier | Usage-based |
| **Vercel** | Free for frontend | Free (Hobby) |

**Recommended**: Railway ($0-5/month) or Render Free Tier for testing

---

## Testing Your Deployment

After setting up, test the WebSocket connection:

**Option 1: Using wscat**
```bash
npm install -g wscat
wscat -c wss://your-backend-url
```

**Option 2: Browser DevTools**
```javascript
const ws = new WebSocket('wss://your-backend-url');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
```

## Need Help?

1. Check backend logs: `railway logs` or Render dashboard
2. Verify environment variables are set
3. Test backend health: `https://your-backend-url/health`
4. Check CORS settings in `backend/src/server.ts`

---

**Next Steps**: Choose one of the options above and deploy your backend!
