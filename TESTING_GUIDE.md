# Testing Guide - OpenAI Realtime API Integration

## Quick Start Testing

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:
```env
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4o-realtime-preview-2024-12-17
CONVEX_URL=https://impartial-orca-713.convex.cloud
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VENUE_ID=1
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_CONVEX_URL=https://impartial-orca-713.convex.cloud
```

Start frontend:
```bash
npm run dev
```

### 3. Open Browser

Navigate to: `http://localhost:5173`

---

## Testing Checklist

### ✅ Backend Endpoints

Test each endpoint individually:

#### 1. Health Check
```bash
curl http://localhost:3000/api/realtime/health
```
Expected: `{"status":"ok","service":"openai-realtime"}`

#### 2. Get Tools
```bash
curl http://localhost:3000/api/realtime/tools | jq
```
Expected: JSON with `tools` array and `instructions` string

#### 3. Create Session (Ephemeral Token)
```bash
curl -X POST http://localhost:3000/api/realtime/session \
  -H "Content-Type: application/json" \
  -d '{"voice":"alloy"}' | jq
```
Expected:
```json
{
  "client_secret": "eph_...",
  "expires_at": "2025-11-29T...",
  "session_id": "sess_...",
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "voice": "alloy"
}
```

#### 4. Execute Tool
```bash
curl -X POST http://localhost:3000/api/realtime/execute-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_drinks",
    "args": {"query": "beer"},
    "sessionId": "test-session"
  }' | jq
```
Expected: Tool result with drink list

---

### ✅ Frontend Integration

#### 1. Connection Test

1. Open browser DevTools (F12)
2. Navigate to Console tab
3. Look for connection logs:
   ```
   ✅ Connected to OpenAI Realtime API
   📝 Transcript: ...
   ```

#### 2. Microphone Permission

- Browser should prompt for microphone access
- Grant permission
- Check that microphone icon is active

#### 3. Audio Test

Speak into microphone:
- "What drinks do you have?"
- "Add two Bud Lights to my cart"
- "Show me the cart"

Expected:
- AI responds with audio
- Transcript appears in console
- UI updates (cart items added)

#### 4. Function Calling Test

Test each major tool category:

**Cart Tools:**
- ✅ "Add Bud Light to cart"
- ✅ "Remove last item"
- ✅ "Show cart"
- ✅ "Clear cart"

**Inventory Tools:**
- ✅ "How much beer do we have?"
- ✅ "Search for IPAs"

**Order Tools:**
- ✅ "Process the order"
- ✅ "Show order history"

**Navigation:**
- ✅ "Go to settings"
- ✅ "Show menu" (products screen)

#### 5. Speaking State

- Voice pulse overlay should appear when AI speaks
- Pink glow animation should be visible
- Should stop when AI finishes speaking

#### 6. Error Handling

Test error scenarios:
- Invalid tool arguments
- Network disconnection
- Token expiration (wait 60+ seconds)

---

## Browser Console Checks

### Expected Logs (Success)

```
Fetching tools from backend...
Received 30+ tools
Creating WebRTC peer connection...
Adding local audio track...
Creating data channel...
Sending SDP offer to OpenAI...
Received SDP answer
✅ Connected to OpenAI Realtime API
Data channel opened
Session configured with tools
```

### Error Logs to Watch For

**Token Expired:**
```
Error: Failed to connect to OpenAI: 401 Unauthorized
```
→ Token expired, regenerate

**Microphone Denied:**
```
Error: Permission denied
```
→ Grant microphone permissions in browser settings

**Network Error:**
```
WebRTC connection failed
```
→ Check HTTPS requirement (production only)

---

## Network Tab Debugging

### Expected Requests

1. **GET /api/realtime/tools**
   - Status: 200
   - Response: Tools and instructions

2. **POST /api/realtime/session**
   - Status: 200
   - Response: Ephemeral token

3. **POST https://api.openai.com/v1/realtime** (CORS preflight)
   - Status: 200
   - Body: SDP answer

4. **POST /api/realtime/execute-tool** (multiple)
   - Status: 200
   - Response: Tool results

### WebRTC Monitoring

In Chrome DevTools:
1. Navigate to `chrome://webrtc-internals`
2. Monitor RTCPeerConnection
3. Check:
   - ICE connection state: `connected`
   - Data channel state: `open`
   - Audio tracks: 2 (local + remote)

---

## Testing Scenarios

### Scenario 1: Basic Order Flow

1. "Show me what beers you have"
2. "Add two Bud Lights to cart"
3. "Add a Heineken"
4. "Show me the cart"
5. "Process the order"

**Expected Results:**
- ✅ Search results displayed
- ✅ Items added to cart
- ✅ Cart total calculated
- ✅ Order processed
- ✅ UI updates in real-time

### Scenario 2: Inventory Check

1. "How much Bud Light is in stock?"
2. "What items are low on inventory?"
3. "Search for vodka"

**Expected Results:**
- ✅ Inventory levels returned
- ✅ Low stock warnings
- ✅ Search results displayed

### Scenario 3: Navigation

1. "Go to transactions"
2. "Show settings"
3. "Go back to menu"

**Expected Results:**
- ✅ Screen changes
- ✅ Navigation confirmed by AI

### Scenario 4: Error Recovery

1. "Add unknown drink to cart"
2. Wait for error message
3. "Add Bud Light instead"

**Expected Results:**
- ✅ AI explains drink not found
- ✅ Suggests alternatives
- ✅ Successfully adds valid drink

---

## Performance Benchmarks

### Latency Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Speech to AI | < 200ms | Time from speech end to AI start |
| Tool Execution | < 500ms | Time to execute backend tool |
| Total Round Trip | < 1s | User speaks → AI responds |

### Testing Latency

Use browser Performance API:
```javascript
// In console
performance.mark('speech-end');
// Wait for AI response
performance.mark('ai-start');
performance.measure('latency', 'speech-end', 'ai-start');
console.log(performance.getEntriesByName('latency'));
```

---

## Common Issues & Solutions

### Issue: No Audio Output

**Symptoms:** AI responds but no sound
**Solutions:**
1. Check browser audio settings
2. Verify audio element in DevTools
3. Check `audioEl.autoplay = true`
4. Try `audioEl.play()` manually

### Issue: Tools Not Executing

**Symptoms:** Function calls logged but no UI updates
**Solutions:**
1. Check `/api/realtime/execute-tool` responses
2. Verify Convex connection
3. Check session ID consistency
4. Inspect tool execution errors in backend logs

### Issue: Frequent Disconnections

**Symptoms:** Connection drops every 60s
**Solutions:**
1. Token expiration - implement refresh
2. Network instability - add retry logic
3. Check firewall/proxy settings

### Issue: Poor Audio Quality

**Symptoms:** Choppy or distorted audio
**Solutions:**
1. Check network bandwidth
2. Verify WebRTC audio codec
3. Test in different browser
4. Check CPU usage (high load affects quality)

---

## Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Full Support | Recommended |
| Edge 90+ | ✅ Full Support | Chromium-based |
| Firefox 88+ | ✅ Full Support | May need permissions prompt |
| Safari 14+ | ⚠️ Limited | WebRTC issues on older versions |
| Mobile Chrome | ✅ Supported | Requires HTTPS in production |
| Mobile Safari | ⚠️ Limited | iOS WebRTC restrictions |

---

## Production Testing

### Pre-Deployment Checklist

- [ ] Backend deployed with HTTPS
- [ ] Frontend deployed with HTTPS
- [ ] OPENAI_API_KEY configured
- [ ] CONVEX_URL configured
- [ ] CORS settings updated
- [ ] Environment variables verified
- [ ] SSL certificate valid
- [ ] Microphone permissions working

### Production URLs

Update `.env` for production:
```env
# Frontend
VITE_API_URL=https://your-backend-url.railway.app

# Backend
OPENAI_API_KEY=sk-proj-production-key
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Testing in Production

1. Test from different networks (WiFi, mobile, corporate)
2. Test with VPN enabled
3. Test on different devices
4. Monitor error rates
5. Check latency metrics

---

## Monitoring & Logging

### Backend Logs to Monitor

```bash
# Watch backend logs
npm run dev | grep "🛠️"  # Tool executions
npm run dev | grep "❌"  # Errors
npm run dev | grep "OpenAI"  # OpenAI events
```

### Frontend Console Filters

In DevTools Console, filter by:
- `OpenAI` - Connection events
- `Tool` - Function calls
- `Error` - Error messages
- `WebRTC` - Connection debugging

### Metrics to Track

- Connection success rate
- Average latency
- Tool execution time
- Error frequency
- Token refresh rate

---

## Troubleshooting Decision Tree

```
Connection fails?
├─ Check backend health endpoint
│  ├─ 500 → Check OPENAI_API_KEY
│  └─ 404 → Backend not running
├─ Check ephemeral token endpoint
│  ├─ 401 → Invalid API key
│  └─ Token expired → Implement refresh
└─ Check WebRTC connection
   ├─ ICE failed → Network/firewall issue
   └─ Data channel closed → Token expired

Audio not working?
├─ Check microphone permissions
├─ Verify audio element creation
├─ Check WebRTC audio tracks
└─ Test browser audio settings

Tools not executing?
├─ Check tool execution endpoint
├─ Verify Convex connection
├─ Check session ID
└─ Inspect backend logs
```

---

## Next Steps After Testing

1. ✅ Verify all tools work
2. ✅ Test in production environment
3. 📝 Document any issues found
4. 🐛 Fix bugs and edge cases
5. 🚀 Deploy to production
6. 📊 Monitor metrics
7. 🔄 Iterate based on feedback

---

**Last Updated:** 2025-11-29
**Testing Framework:** Manual + Browser DevTools
**CI/CD:** Not yet configured (future enhancement)
