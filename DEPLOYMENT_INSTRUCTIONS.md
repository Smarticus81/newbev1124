# Deployment Instructions - OpenAI Realtime API

## ⚠️ IMPORTANT: Two-Part Deployment Required

This application requires **TWO separate deployments**:
1. **Backend** - Node.js API (Railway, Render, or Fly.io)
2. **Frontend** - React SPA (Vercel)

The frontend connects to the backend via REST API for token generation and tool execution.

---

## 🚀 Step 1: Deploy Backend First

### Option A: Railway (Recommended - Easiest)

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login to Railway
```bash
railway login
```

#### 3. Deploy Backend
```bash
cd backend
railway init
railway up
```

#### 4. Set Environment Variables
```bash
railway variables set OPENAI_API_KEY="sk-proj-your-key"
railway variables set CONVEX_URL="https://impartial-orca-713.convex.cloud"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
railway variables set VENUE_ID="1"
```

#### 5. Get Your Backend URL
```bash
railway domain
```

You'll get something like: `https://newbev1124-backend-production.up.railway.app`

**Save this URL - you'll need it for the frontend!**

---

### Option B: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository: `Smarticus81/newbev1124`
4. Configure:
   - **Name**: `newbev1124-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `OPENAI_API_KEY` = your OpenAI key
   - `CONVEX_URL` = `https://impartial-orca-713.convex.cloud`
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `VENUE_ID` = `1`
6. Deploy
7. Copy the service URL (e.g., `https://newbev1124-backend.onrender.com`)

---

## 🌐 Step 2: Configure Frontend on Vercel

### Set Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `newbev1124`
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL from Step 1 (e.g., `https://newbev1124-backend-production.up.railway.app`)
   - **Environments**: ✓ Production ✓ Preview ✓ Development
5. Click **Save**

### Redeploy Frontend

After setting the environment variable:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## ✅ Step 3: Verify Deployment

### Test Backend

```bash
# Replace with your backend URL
BACKEND_URL="https://your-backend.railway.app"

# Health check
curl $BACKEND_URL/api/realtime/health
# Expected: {"status":"ok","service":"openai-realtime"}

# Get tools
curl $BACKEND_URL/api/realtime/tools | jq .
# Expected: JSON with tools array

# Create session
curl -X POST $BACKEND_URL/api/realtime/session \
  -H "Content-Type: application/json" \
  -d '{"voice":"alloy"}' | jq .
# Expected: ephemeral token response
```

### Test Frontend

1. Open your Vercel URL: `https://your-app.vercel.app`
2. Open browser DevTools (F12) → Console
3. Grant microphone permissions
4. Look for connection logs:
   ```
   API URL: https://your-backend.railway.app
   Fetching tools from backend...
   ✅ Connected to OpenAI Realtime API
   ```

If you see errors about "Backend not available", the `VITE_API_URL` is not set correctly.

---

## 🔧 Environment Variables Summary

### Backend (Railway/Render)
```env
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4o-realtime-preview-2024-12-17
CONVEX_URL=https://impartial-orca-713.convex.cloud
NODE_ENV=production
PORT=3000
VENUE_ID=1
FRONTEND_URL=https://your-app.vercel.app  # Optional, for CORS
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.railway.app
VITE_CONVEX_URL=https://impartial-orca-713.convex.cloud
```

---

## 🐛 Troubleshooting

### Error: "Backend not available"

**Symptoms:**
```
Failed to fetch tools: SyntaxError: Unexpected token '<'
Backend not available. Please ensure:
1. Backend is deployed and running
2. VITE_API_URL environment variable is set
```

**Solution:**
1. Check backend is deployed and running
2. Verify `VITE_API_URL` is set in Vercel
3. Redeploy frontend after setting variable
4. Check backend URL is accessible: `curl https://your-backend.railway.app/api/realtime/health`

### Error: "OPENAI_API_KEY not configured"

**Solution:**
1. Set `OPENAI_API_KEY` in backend deployment (Railway/Render)
2. Restart backend service
3. Get API key from: https://platform.openai.com/api-keys

### Error: "CORS error"

**Symptoms:** Browser console shows CORS policy error

**Solution:**
1. Set `FRONTEND_URL` in backend environment variables
2. Value should be your Vercel URL
3. Restart backend

### Error: "Connection refused"

**Symptoms:** Cannot connect to backend

**Solution:**
1. Check backend is running: `railway logs` or Render dashboard
2. Verify backend URL is correct
3. Check firewall/network settings

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────┐
│  User's Browser                          │
│  https://your-app.vercel.app            │
└────────────┬────────────────────────────┘
             │
             │ REST API (tools, tokens)
             │
             ▼
┌─────────────────────────────────────────┐
│  Backend API                             │
│  https://your-backend.railway.app       │
│  - Token generation                      │
│  - Tool execution                        │
│  - Convex integration                    │
└────────────┬────────────────────────────┘
             │
             │
    ┌────────┴────────┬──────────┐
    │                 │          │
    ▼                 ▼          ▼
┌────────┐    ┌──────────┐  ┌────────┐
│ OpenAI │    │  Convex  │  │ Other  │
│  API   │    │  Database│  │Services│
└────────┘    └──────────┘  └────────┘
```

**WebRTC Connection:**
```
User's Browser ←── WebRTC P2P ──→ OpenAI Realtime API
               (audio + data channel)
```

---

## 💰 Cost Estimate

### Free Tier
- **Vercel**: Free (Hobby plan)
- **Railway**: $5 free credit/month
- **Render**: 750 hrs/month (sleeps after inactivity)
- **OpenAI**: Pay-per-use (Realtime API)
- **Convex**: Free tier available

### Recommended Starting Plan
- Vercel: Free
- Railway: $5-10/month (or Render Free)
- OpenAI: ~$0.06/minute of audio
- **Total**: ~$5-15/month (depending on usage)

---

## 🎯 Quick Deploy Checklist

- [ ] Get OpenAI API key from platform.openai.com
- [ ] Deploy backend to Railway/Render
- [ ] Set backend environment variables (OPENAI_API_KEY, etc.)
- [ ] Get backend URL
- [ ] Set VITE_API_URL in Vercel
- [ ] Redeploy frontend
- [ ] Test backend health endpoint
- [ ] Test frontend connection
- [ ] Grant microphone permissions
- [ ] Test voice commands

---

## 📚 Next Steps

1. ✅ Deploy backend
2. ✅ Configure Vercel
3. 🧪 Test thoroughly
4. 📊 Monitor usage and costs
5. 🔧 Optimize based on metrics
6. 🚀 Launch to users!

---

## 🆘 Need Help?

- **Backend Issues**: Check Railway/Render logs
- **Frontend Issues**: Check Vercel deployment logs
- **API Issues**: Check OpenAI dashboard
- **WebRTC Issues**: Check browser console

**Documentation:**
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive testing
- [OPENAI_MIGRATION_GUIDE.md](./OPENAI_MIGRATION_GUIDE.md) - Architecture details
- [OPENAI_API_REFERENCE.md](./OPENAI_API_REFERENCE.md) - API endpoints

---

**Last Updated**: 2025-11-29
**Deployment Architecture**: Backend (Railway/Render) + Frontend (Vercel)
**Voice Pipeline**: OpenAI Realtime API with WebRTC
