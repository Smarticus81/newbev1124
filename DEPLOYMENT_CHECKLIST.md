# Railway Deployment Checklist

## Pre-Deployment Setup

### 1. Convex Setup
- [ ] Create Convex project at https://convex.dev
- [ ] Deploy Convex functions: `cd backend && npx convex deploy`
- [ ] Copy deployment URL (e.g., `https://xxx.convex.cloud`)

### 2. Google Gemini API
- [ ] Get API key from https://ai.google.dev/
- [ ] Keep API key ready for Railway environment variables

### 3. Railway Project Setup
- [ ] Create new Railway project
- [ ] Connect to this GitHub repository
- [ ] Set root directory to `/` (monorepo deployment)

## Railway Configuration

### 4. Environment Variables
Add these in Railway project settings → Variables:

```
GEMINI_API_KEY=AIza...your_key
CONVEX_URL=https://your-deployment.convex.cloud
NODE_ENV=production
FRONTEND_URL=https://your-project.up.railway.app
VENUE_NAME=Your Venue Name
VENUE_ID=1
```

**Note:** Railway automatically provides `PORT` variable - don't set it manually.

### 5. Build Settings
Railway should auto-detect from `nixpacks.toml` in root:
- [ ] Builder: NIXPACKS
- [ ] Start Command: `cd backend && node dist/src/server.js`

If not auto-detected, set manually in Railway settings.

## Deployment

### 6. Deploy
- [ ] Push to GitHub main branch or trigger manual deploy
- [ ] Wait for build to complete
- [ ] Check build logs for errors

### 7. Verify Deployment

#### Health Check
```bash
curl https://your-project.up.railway.app/health
```
Expected response:
```json
{"status":"ok","timestamp":"2025-..."}
```

#### Frontend Access
- [ ] Open `https://your-project.up.railway.app` in browser
- [ ] Verify frontend loads
- [ ] Check console for errors

#### WebSocket Connection
- [ ] Click voice button in the UI
- [ ] Check browser console for WebSocket connection
- [ ] Should see: "✅ Connected to Voice Backend"
- [ ] WebSocket URL should be: `wss://your-project.up.railway.app`

### 8. Test Voice Features
- [ ] Allow microphone permissions
- [ ] Say "Hey Bev" (wake word)
- [ ] System should respond
- [ ] Try voice commands:
  - "Show me the menu"
  - "Add a beer to the cart"
  - "Show cart"

## Troubleshooting

### Build Fails

**Check:**
- [ ] All dependencies are in package.json (not just devDependencies)
- [ ] TypeScript compiles without errors locally
- [ ] nixpacks.toml syntax is correct

**Common fixes:**
```bash
# Test build locally
cd frontend && npm run build
cd ../backend && npm run build
```

### Server Crashes on Start

**Check Railway logs for:**
- [ ] Missing environment variables (especially CONVEX_URL, GEMINI_API_KEY)
- [ ] Port binding errors (should use $PORT from Railway)
- [ ] Module import errors

**Fix:**
- Ensure all environment variables are set in Railway
- Check that `NODE_ENV=production` is set
- Verify Convex deployment is accessible

### WebSocket Connection Fails

**Check:**
- [ ] Browser console shows correct WebSocket URL
- [ ] URL should be `wss://` (not `ws://`)
- [ ] Server logs show WebSocket server started
- [ ] No firewall/proxy blocking WebSocket

**Fix:**
- Verify server listens on PORT from environment
- Check Railway logs for WebSocket initialization
- Test from different network/browser

### Frontend Not Loading

**Check:**
- [ ] Build copied frontend files: `backend/dist/frontend/index.html`
- [ ] Server serves static files correctly
- [ ] Check Railway logs for file serving errors

**Fix:**
```bash
# Verify build locally
ls backend/dist/frontend/
# Should show: index.html, assets/, images/, etc.
```

### API Requests Fail

**Check:**
- [ ] CORS settings in server.ts
- [ ] FRONTEND_URL matches Railway URL
- [ ] API routes are correct (/api/*)

**Fix:**
- Update FRONTEND_URL in Railway variables
- Check server logs for request errors
- Verify Convex connection works

## Monitoring

### Railway Dashboard
- [ ] Check Metrics tab for CPU/Memory usage
- [ ] Monitor Deployments tab for errors
- [ ] View Logs for runtime issues

### Application Logs
Watch logs for:
```
HTTP server listening on port XXX
WebSocket server listening on port XXX
Voice POS backend ready!
```

### Health Endpoint
Set up monitoring (optional):
```bash
# Every 5 minutes
curl https://your-project.up.railway.app/health
```

## Rollback Plan

If deployment fails:
1. [ ] Check Railway deployment history
2. [ ] Rollback to previous working deployment
3. [ ] Review error logs
4. [ ] Test fixes locally before redeploying

## Success Criteria

Deployment is successful when:
- [x] Health endpoint returns 200 OK
- [x] Frontend loads without errors
- [x] WebSocket connects successfully
- [x] Voice features work (wake word detection)
- [x] Cart operations work
- [x] No crashes in Railway logs for 5+ minutes

## Post-Deployment

### Optional Enhancements
- [ ] Set up custom domain in Railway
- [ ] Configure SSL certificate (automatic with Railway)
- [ ] Set up monitoring/alerting
- [ ] Configure auto-scaling if needed
- [ ] Set up staging environment

### Documentation
- [ ] Update README with production URL
- [ ] Document any environment-specific configurations
- [ ] Share deployment guide with team

## Support

If issues persist:
1. Check Railway documentation: https://docs.railway.app/
2. Check Railway community: https://discord.gg/railway
3. Review deployment logs carefully
4. Test build process locally first
5. Verify all environment variables are set correctly

---

**Last Updated:** 2025-11-26  
**Deployment Type:** Monorepo (Frontend + Backend)  
**Platform:** Railway  
**Build System:** Nixpacks
