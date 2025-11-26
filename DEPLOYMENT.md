# Deployment Fix Summary

## Issue
The application was crashing on deployment because it was trying to listen on two separate ports (HTTP on PORT and WebSocket on WS_PORT), but Railway only exposes one port via the `$PORT` environment variable.

## Solution
Modified the server architecture to run both HTTP and WebSocket on a single port, making it compatible with Railway's deployment model.

## Changes Made

### 1. Backend Server (`/workspace/backend/src/server.ts`)

**Before:**
- Created two separate HTTP servers
- HTTP server on port 3000 using `serve()` from `@hono/node-server`
- WebSocket server on port 3001 using separate `createServer()`
- Both servers listened independently

**After:**
- Created a single HTTP server using Node's `createServer()`
- Attached Hono app to handle HTTP requests
- Attached WebSocket server to the same HTTP server
- Both services now listen on the same port (configurable via `$PORT` environment variable)

**Key Code Changes:**
```typescript
// Create single HTTP server
const httpServer = createServer();

// Attach Hono app to handle HTTP requests
httpServer.on('request', async (req, res) => {
    // Convert Node.js request to Web API Request
    // Process through Hono app
    // Stream response back
});

// Attach WebSocket server to same HTTP server
const wss = new WebSocketServer({ server: httpServer });

// Listen on single port
httpServer.listen(PORT, () => {
    logger.info(`HTTP server listening on port ${PORT}`);
    logger.info(`WebSocket server listening on port ${PORT}`);
});
```

### 2. Frontend WebSocket Configuration (`/workspace/frontend/src/App.tsx`)

**Before:**
```typescript
const wsUrl = import.meta.env.VITE_WS_URL 
    || (import.meta.env.PROD 
        ? `wss://${window.location.hostname.replace('frontend', 'backend')}`
        : 'ws://localhost:3001');
```

**After:**
```typescript
const wsUrl = import.meta.env.VITE_WS_URL 
    || (import.meta.env.PROD 
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
        : 'ws://localhost:3001');
```

**Rationale:**
- In production (monorepo deployment), WebSocket is on the same host and port as HTTP
- Auto-detects protocol (wss for https, ws for http)
- Uses same host and port as the current page
- Development still uses separate port (3001) for WebSocket

### 3. Build Configuration (`/workspace/nixpacks.toml`)

**Before:**
```toml
[phases.build]
cmds = [
  "cd frontend && npm run build",
  "cd backend && npm run build",
  "mkdir -p backend/dist/frontend",
  "cp -r frontend/dist backend/dist/frontend/",  # Created nested dist folder
]
```

**After:**
```toml
[phases.build]
cmds = [
  "cd frontend && npm run build",
  "cd backend && npm run build",
  "mkdir -p backend/dist/frontend",
  "cp -r frontend/dist/* backend/dist/frontend/",  # Copy contents directly
]
```

**Rationale:**
- Copies contents of `frontend/dist` directly into `backend/dist/frontend/`
- Avoids nested `backend/dist/frontend/dist/` structure
- Static file serving paths in server.ts now work correctly

### 4. Static File Serving (`/workspace/backend/src/server.ts`)

**Updated paths:**
```typescript
const frontendDistPath = path.join(__dirname, '../frontend');

// Serve static assets
app.use('/assets/*', serveStatic({ root: './dist/frontend' }));
app.use('/drink_images/*', serveStatic({ root: './dist/frontend' }));
// ... other static routes
```

### 5. Environment Variables (`/workspace/backend/.env.example`)

**Removed:**
- `WS_PORT=3001` (no longer needed in production)

**Added:**
- `CONVEX_URL` (required for the application)

**Updated:**
- `GEMINI_API_KEY` placeholder (removed hardcoded key)
- `FRONTEND_URL` example for production

### 6. Documentation Updates

Updated `README.md` to reflect:
- Single port architecture in production
- Monorepo deployment structure
- Railway deployment instructions
- Environment variable requirements
- WebSocket connection behavior

## Deployment Flow

### Railway Build Process
1. Install dependencies: `npm ci` for both frontend and backend
2. Build frontend: `npm run build` → produces `frontend/dist`
3. Build backend: `npm run build` → produces `backend/dist`
4. Copy frontend build: `cp -r frontend/dist/* backend/dist/frontend/`
5. Start server: `node backend/dist/src/server.js`

### Runtime Behavior
- Server listens on `$PORT` (provided by Railway)
- HTTP requests to `/api/*` → API endpoints
- HTTP requests to `/health` → Health check
- WebSocket upgrade requests → WebSocket handler
- All other HTTP requests → Frontend SPA (index.html)
- Static assets served from `backend/dist/frontend/`

## Railway Deployment Options

### Option 1: Monorepo Deployment (Recommended)

Deploy from the **root directory** - Railway will use `/workspace/nixpacks.toml`:
- Builds both frontend and backend
- Serves everything from one service
- Single port for HTTP and WebSocket
- More cost-effective

### Option 2: Separate Services

Deploy backend and frontend as separate Railway services:
- Backend uses `/workspace/backend/railway.json` and `/workspace/backend/nixpacks.toml`
- Frontend uses `/workspace/frontend/railway.json` and `/workspace/frontend/nixpacks.toml`
- **Note:** Backend must still use single port (no WS_PORT)
- Requires CORS configuration
- More expensive (two services)

**Recommendation:** Use Option 1 (Monorepo) for Railway deployment.

## Environment Variables for Railway

Required environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
CONVEX_URL=https://your-convex-deployment.convex.cloud
NODE_ENV=production
FRONTEND_URL=https://your-railway-app.up.railway.app
VENUE_NAME="Your Venue Name"
VENUE_ID=1
```

Railway automatically provides:
- `PORT` - The port to listen on

## Testing Locally

### Development Mode (Two Ports)
```bash
# Terminal 1: Backend (ports 3000 + 3001)
cd backend
npm run dev

# Terminal 2: Frontend (port 5173)
cd frontend
npm run dev
```

### Production Mode (Single Port)
```bash
# Build everything
cd frontend && npm run build
cd ../backend && npm run build
mkdir -p dist/frontend
cp -r ../frontend/dist/* dist/frontend/

# Run production server (single port 3000)
PORT=3000 NODE_ENV=production node dist/src/server.js
```

Access at: `http://localhost:3000`
WebSocket at: `ws://localhost:3000`

## Verification Checklist

- [x] Backend builds without errors
- [x] Frontend builds without errors
- [x] Build process copies frontend to backend correctly
- [x] Server listens on single port
- [x] HTTP requests work
- [x] WebSocket connections work on same port
- [x] Static files serve correctly
- [x] SPA routing works (index.html fallback)
- [x] Environment variables documented
- [x] README updated
- [x] No linter errors

## Architecture Diagram

```
Railway Deployment (Single Port)
├── HTTP Server (Port $PORT)
│   ├── Hono App (HTTP Requests)
│   │   ├── /health → Health Check
│   │   ├── /api/* → API Endpoints
│   │   └── /* → Frontend SPA
│   └── WebSocket Server (Upgrade Requests)
│       ├── Binary Messages (Audio)
│       └── JSON Control Messages
└── Static Files
    └── /dist/frontend/*
        ├── index.html
        ├── /assets/*
        ├── /drink_images/*
        └── /images/*
```

## Benefits

1. **Railway Compatible**: Single port requirement satisfied
2. **Simplified Deployment**: No need to configure multiple services
3. **Cost Effective**: One service instead of two
4. **Better Security**: No CORS issues between services
5. **Easier Debugging**: All logs in one place
6. **Auto-scaling**: Single service scales together

## Backward Compatibility

- Development mode still uses two ports (3000 and 3001)
- Existing development workflows unchanged
- Environment variables remain the same for local dev
- Only production deployment architecture changed
