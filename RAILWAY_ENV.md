# Environment Variables for Railway Deployment

## Backend Environment Variables
Copy these to Railway backend service:

```
GEMINI_API_KEY=<your_gemini_api_key>
CONVEX_DEPLOYMENT=<your_convex_url>
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-url.railway.app
```

## Frontend Environment Variables
Copy these to Railway frontend service:

```
VITE_CONVEX_URL=<your_convex_deployment_url>
VITE_BACKEND_WS_URL=wss://your-backend.railway.app
```

## How to Get These Values

### GEMINI_API_KEY
- Get from: https://aistudio.google.com/app/apikey
- Current key is in: backend/.env.local

### CONVEX_DEPLOYMENT
- Get from: https://dashboard.convex.dev
- Format: https://your-project.convex.cloud

### Railway URLs
- Backend URL: Will be provided after backend deployment
- Frontend URL: Will be provided after frontend deployment

## Deployment Order

1. Deploy Backend first
2. Copy backend Railway URL
3. Update VITE_BACKEND_WS_URL with backend URL
4. Deploy Frontend
5. Copy frontend Railway URL  
6. Update ALLOWED_ORIGINS in backend with frontend URL
7. Redeploy backend

## Testing After Deployment

Visit: https://your-frontend.railway.app
- Click voice button
- Say: "Hey Bev, add Bud Light to cart"
- Verify it works!
