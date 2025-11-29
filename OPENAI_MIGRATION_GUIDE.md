# OpenAI Realtime API Migration Guide

## Overview

This project has been migrated from **Gemini Live API** to **OpenAI Realtime API with WebRTC**.

## ✅ Completed Changes

### Backend (100% Complete)

#### 1. Dependencies Updated
- ❌ Removed: `@google/genai`
- ✅ Added: `openai` (v4.77.3)
- Updated package.json keywords: `gemini` → `openai`, `websocket` → `webrtc`

#### 2. New API Endpoints

**`POST /api/realtime/session`**
- Generates ephemeral tokens for WebRTC authentication
- Tokens valid for 60 seconds
- Returns: `client_secret`, `session_id`, `expires_at`

**`GET /api/realtime/tools`**
- Returns OpenAI-formatted function definitions
- Includes system instructions

**`POST /api/realtime/execute-tool`**
- Executes tools from frontend
- Required fields: `name`, `args`, `sessionId`

#### 3. Tool Registry Enhanced
- Added `toOpenAITools()` method for OpenAI function calling format
- Maintains backward compatibility with Gemini format
- All 30+ tools automatically converted to OpenAI format

#### 4. Environment Variables
- `OPENAI_API_KEY` (required) - Replace `GEMINI_API_KEY`
- `OPENAI_MODEL` (optional) - Default: `gpt-4o-realtime-preview-2024-12-17`

### Frontend (Library Ready, Integration Pending)

#### 1. OpenAI Realtime Client Created
**File**: `/frontend/src/lib/OpenAIRealtimeClient.ts`

**Features**:
- ✅ WebRTC RTCPeerConnection setup
- ✅ Ephemeral token authentication
- ✅ Data channel for bidirectional communication
- ✅ Audio streaming via WebRTC audio tracks
- ✅ Function calling support
- ✅ Event handling (transcripts, function calls, speaking state)
- ✅ Interrupt capability

**Key Methods**:
```typescript
async connect(): Promise<void>
sendFunctionResult(callId: string, result: any): void
interrupt(): void
disconnect(): void
```

## 🚧 Remaining Work

### Frontend Integration (40-60 hours)

The existing `useVoiceClient.ts` hook (~500 lines) needs to be refactored to use the OpenAI client:

#### Required Changes:

1. **Replace WebSocket with WebRTC** (~8-12 hours)
   - Remove WebSocket connection logic (lines 134-190)
   - Initialize OpenAIRealtimeClient instead
   - Handle connection state with WebRTC events

2. **Update Audio Handling** (~6-8 hours)
   - WebRTC handles audio automatically via RTCPeerConnection
   - Remove custom audio worklet if not needed
   - OpenAI provides audio via remote audio track
   - May need to adjust for wake word detection

3. **Adapt Function Calling** (~4-6 hours)
   - Update `handleControlMessage` to handle OpenAI events
   - Call backend `/api/realtime/execute-tool` endpoint
   - Send results back via `sendFunctionResult()`

4. **Wake Word Integration** (~8-12 hours)
   - Current implementation uses browser Speech Recognition
   - Options:
     a. Keep wake word in browser, then activate OpenAI connection
     b. Use OpenAI's built-in VAD (Voice Activity Detection)
     c. Hybrid approach

5. **Session Management** (~4-6 hours)
   - Fetch tools configuration on connection
   - Configure OpenAI session with tools
   - Handle session lifecycle

6. **Error Handling & Reconnection** (~4-6 hours)
   - WebRTC connection recovery
   - Token expiration handling (60s limit)
   - Network interruption recovery

7. **Testing & Debugging** (~6-10 hours)
   - Test all 30+ tool integrations
   - Verify audio quality
   - Test interruptions
   - Browser compatibility testing

## 📋 Integration Example

Here's a simplified example of how to integrate the OpenAI client:

```typescript
// In useVoiceClient.ts

import { OpenAIRealtimeClient, RealtimeClientEvents } from '../lib/OpenAIRealtimeClient';

export const useVoiceClient = (apiUrl: string, onToolExecuted?: (name: string, result: any) => void) => {
    const clientRef = useRef<OpenAIRealtimeClient | null>(null);

    // Fetch tools configuration
    const fetchTools = async () => {
        const response = await fetch(`${apiUrl}/api/realtime/tools`);
        const { tools, instructions } = await response.json();
        return { tools, instructions };
    };

    // Create OpenAI client
    const connect = useCallback(async () => {
        const { tools, instructions } = await fetchTools();

        const events: RealtimeClientEvents = {
            onConnected: () => {
                setState(prev => ({ ...prev, isConnected: true }));
            },
            onDisconnected: () => {
                setState(prev => ({ ...prev, isConnected: false }));
            },
            onError: (error) => {
                setState(prev => ({ ...prev, error: error.message }));
            },
            onAudioData: (audioData) => {
                // Handle audio playback
            },
            onTranscript: (text, isFinal) => {
                // Handle transcript display
            },
            onFunctionCall: async (name, args, callId) => {
                // Execute tool
                const response = await fetch(`${apiUrl}/api/realtime/execute-tool`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, args, sessionId: state.sessionId }),
                });
                const { result } = await response.json();

                // Send result back to OpenAI
                clientRef.current?.sendFunctionResult(callId, result);

                // Notify app
                if (onToolExecuted) {
                    onToolExecuted(name, result);
                }
            },
            onSpeakingStarted: () => {
                setState(prev => ({ ...prev, isSpeaking: true }));
            },
            onSpeakingStopped: () => {
                setState(prev => ({ ...prev, isSpeaking: false }));
            },
        };

        const client = new OpenAIRealtimeClient(
            {
                apiUrl,
                voice: 'alloy',
                instructions,
                tools,
            },
            events
        );

        await client.connect();
        clientRef.current = client;
    }, [apiUrl]);

    // ... rest of the hook
};
```

## 🔧 Development Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Update Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-proj-...your-key...
OPENAI_MODEL=gpt-4o-realtime-preview-2024-12-17
CONVEX_URL=https://your-convex-deployment.convex.cloud
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
VENUE_ID=1
```

### 3. Start Backend
```bash
npm run dev
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Resources & References

### Official Documentation
- **OpenAI Realtime API**: https://platform.openai.com/docs/guides/realtime-webrtc
- **OpenAI Realtime Console Example**: https://github.com/openai/openai-realtime-console

### Technical Guides
- **WebRTC Hacks Guide**: https://webrtchacks.com/the-unofficial-guide-to-openai-realtime-webrtc-api/
- **Microsoft Azure Guide**: https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/realtime-audio-webrtc
- **Medium Tutorial**: https://medium.com/@kenzic/getting-started-openai-realtime-and-webrtc-80e880c574e0

### Example Repositories
- **gbaeke/realtime-webrtc**: https://github.com/gbaeke/realtime-webrtc
- **mostafa-drz/openai-realtime-webrtc**: https://github.com/mostafa-drz/openai-realtime-webrtc

## 🎯 Benefits of WebRTC Migration

1. **Lower Latency**
   - Peer-to-peer connection to OpenAI
   - No backend relay needed for audio

2. **Better Audio Quality**
   - Native browser WebRTC audio handling
   - Built-in echo cancellation, noise suppression

3. **Standard Protocol**
   - Industry-standard WebRTC
   - Better browser compatibility

4. **Simplified Architecture**
   - Backend only handles auth & tool execution
   - Frontend connects directly to OpenAI

5. **Cost Efficiency**
   - Less backend bandwidth usage
   - No audio relay overhead

## ⚠️ Important Notes

### Ephemeral Token Expiration
- Tokens expire after 60 seconds
- Regenerate token if connection takes > 60s
- Frontend should handle token refresh

### Browser Compatibility
- WebRTC works in all modern browsers
- Requires HTTPS in production (except localhost)
- Microphone permissions required

### Audio Handling
- OpenAI sends audio via WebRTC audio tracks
- Browser automatically handles playback
- Custom audio processing optional

### Function Calling
- Tools sent via data channel
- Execution happens on backend
- Results sent back to OpenAI via data channel

## 🔄 Rollback Plan

If you need to revert to Gemini Live:

```bash
git revert db4f9e0  # Revert OpenAI migration commit
npm install          # Reinstall Gemini dependencies
```

Update `.env`:
```env
GEMINI_API_KEY=your-gemini-key
```

## 📞 Support

For issues or questions:
1. Check OpenAI Realtime API documentation
2. Review example repositories
3. Test with OpenAI Realtime Console
4. Check browser console for WebRTC errors

## 🎉 Next Steps

1. ✅ Backend is ready - deploy and test endpoints
2. 🚧 Complete frontend integration (see "Remaining Work" above)
3. 🧪 Test with all tools and features
4. 📝 Update user documentation
5. 🚀 Deploy to production

---

**Migration Date**: 2025-11-29
**OpenAI Model**: gpt-4o-realtime-preview-2024-12-17
**Architecture**: WebRTC Peer-to-Peer
