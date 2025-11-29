# OpenAI Realtime API - Backend Endpoints

## Quick Reference

### Authentication Endpoint

#### `POST /api/realtime/session`

Create an ephemeral token for WebRTC connection.

**Request:**
```json
{
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "voice": "alloy",
  "instructions": "Optional system instructions"
}
```

**Response:**
```json
{
  "client_secret": "eph_...",
  "expires_at": "2025-11-29T12:35:00Z",
  "session_id": "sess_...",
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "voice": "alloy"
}
```

**Notes:**
- Token expires in 60 seconds
- Use `client_secret` for WebRTC authentication
- Must be called before each WebRTC connection

---

### Tools Configuration

#### `GET /api/realtime/tools`

Get all available tools in OpenAI function calling format.

**Response:**
```json
{
  "tools": [
    {
      "type": "function",
      "name": "add_to_cart",
      "description": "Add a drink to the customer's cart",
      "parameters": {
        "type": "object",
        "properties": {
          "drink_name": { "type": "string" },
          "quantity": { "type": "integer", "default": 1 }
        },
        "required": ["drink_name"]
      }
    }
    // ... 30+ more tools
  ],
  "instructions": "System prompt for the AI assistant"
}
```

**Usage:**
```typescript
const response = await fetch('/api/realtime/tools');
const { tools, instructions } = await response.json();

// Configure OpenAI session
client.sendEvent({
  type: 'session.update',
  session: {
    instructions,
    tools,
    tool_choice: 'auto',
  },
});
```

---

### Tool Execution

#### `POST /api/realtime/execute-tool`

Execute a tool from the frontend.

**Request:**
```json
{
  "name": "add_to_cart",
  "args": {
    "drink_name": "Bud Light",
    "quantity": 2
  },
  "sessionId": "unique-session-id"
}
```

**Response - Success:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "message": "Added 2x Bud Light to cart",
    "orderId": "ord_123",
    "total": 12.00
  }
}
```

**Response - Error:**
```json
{
  "error": "Drink 'Unknown Brand' not found in our system"
}
```

**Usage Flow:**
1. OpenAI sends function call via data channel
2. Frontend calls this endpoint to execute tool
3. Backend executes tool with Convex
4. Frontend sends result back to OpenAI

---

## Complete Integration Example

### Frontend: WebRTC Connection Flow

```typescript
// 1. Get ephemeral token
const tokenRes = await fetch('/api/realtime/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o-realtime-preview-2024-12-17',
    voice: 'alloy',
  }),
});
const { client_secret } = await tokenRes.json();

// 2. Create WebRTC peer connection
const pc = new RTCPeerConnection();

// 3. Add local microphone
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// 4. Create data channel for events
const dc = pc.createDataChannel('oai-events');

// 5. Handle remote audio
pc.ontrack = (event) => {
  const audio = new Audio();
  audio.autoplay = true;
  audio.srcObject = event.streams[0];
};

// 6. Create offer and connect
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const sdpRes = await fetch('https://api.openai.com/v1/realtime', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${client_secret}`,
    'Content-Type': 'application/sdp',
  },
  body: offer.sdp,
});

const answerSdp = await sdpRes.text();
await pc.setRemoteDescription({
  type: 'answer',
  sdp: answerSdp,
});

// 7. Get tools and configure session
const toolsRes = await fetch('/api/realtime/tools');
const { tools, instructions } = await toolsRes.json();

dc.send(JSON.stringify({
  type: 'session.update',
  session: {
    instructions,
    tools,
    tool_choice: 'auto',
  },
}));

// 8. Handle function calls
dc.onmessage = async (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'response.function_call_arguments.done') {
    const { call_id, name, arguments: argsStr } = message;
    const args = JSON.parse(argsStr);

    // Execute tool
    const execRes = await fetch('/api/realtime/execute-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, args, sessionId: 'my-session' }),
    });
    const { result } = await execRes.json();

    // Send result back to OpenAI
    dc.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id,
        output: JSON.stringify(result),
      },
    }));

    // Trigger response generation
    dc.send(JSON.stringify({ type: 'response.create' }));
  }
};
```

---

## Available Tools

### Cart Management (5 tools)
- `add_to_cart` - Add item to cart
- `add_multiple_to_cart` - Add multiple items at once
- `remove_from_cart` - Remove item from cart
- `show_cart` - Display current cart
- `clear_cart` - Empty the cart

### Inventory (7 tools)
- `check_inventory` - Check stock levels
- `search_drinks` - Search for products
- `start_inventory_count` - Begin inventory count
- `update_inventory_count` - Update count
- `close_inventory_count` - Finalize count
- `create_adjustment` - Create inventory adjustment
- `read_adjustment_history` - View adjustment history

### Orders (5 tools)
- `process_order` - Complete the order
- `get_orders_list` - View order history
- `create_tab` - Open a new tab
- `close_tab` - Close a tab
- `void_transaction` - Void a transaction

### Products & Categories (7 tools)
- `create_product` - Create new product
- `read_product` - Get product details
- `update_product` - Update product info
- `archive_product` - Archive product
- `create_category` - Create category
- `update_category` - Update category
- `delete_category` - Delete category

### Events (3 tools)
- `create_event_allocation` - Allocate inventory for event
- `update_event_consumption` - Track event usage
- `close_event_inventory` - Close event allocation

### Navigation & System (3 tools)
- `navigate_to_screen` - Switch UI screens
- `terminate_session` - End the conversation

---

## Voice Options

Available voices for `POST /api/realtime/session`:
- `alloy` - Neutral, balanced
- `echo` - Warm, conversational
- `shimmer` - Bright, energetic
- `ash` - Clear, professional (new)
- `ballad` - Calm, soothing (new)
- `coral` - Friendly, upbeat (new)
- `sage` - Wise, measured (new)
- `verse` - Expressive, dynamic (new)

---

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "error": "OpenAI API key not configured"
}
```
→ Check `OPENAI_API_KEY` in `.env`

**400 Bad Request**
```json
{
  "error": "Missing required fields: name, args, sessionId"
}
```
→ Ensure all required fields are present

**500 Internal Server Error**
```json
{
  "error": "Tool execution failed: Drink not found"
}
```
→ Tool-specific error, check logs for details

### WebRTC Connection Issues

**Token Expired**
- Regenerate token if connection takes > 60s
- Frontend should retry with new token

**ICE Connection Failed**
- Check network/firewall settings
- HTTPS required in production
- STUN/TURN servers may be needed for restrictive networks

---

## Environment Variables

Required in `/backend/.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-realtime-preview-2024-12-17

# Convex
CONVEX_URL=https://your-deployment.convex.cloud

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
VENUE_ID=1
```

---

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/api/realtime/health
# Response: {"status":"ok","service":"openai-realtime"}
```

### Get Tools
```bash
curl http://localhost:3000/api/realtime/tools
```

### Create Session
```bash
curl -X POST http://localhost:3000/api/realtime/session \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-realtime-preview-2024-12-17","voice":"alloy"}'
```

### Execute Tool
```bash
curl -X POST http://localhost:3000/api/realtime/execute-tool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "add_to_cart",
    "args": {"drink_name": "Bud Light", "quantity": 2},
    "sessionId": "test-session"
  }'
```

---

**Last Updated**: 2025-11-29
**API Version**: v1
**Model**: gpt-4o-realtime-preview-2024-12-17
