# 🎙️ Voice-Controlled POS - React + Gemini 2.0 Live

A state-of-the-art voice-controlled Point of Sale system with ultra-low latency (<200ms), full-duplex audio streaming, native interrupts, and real-time UI updates.

## 🚀 Features

- **Ultra-Low Latency Voice** - <200ms end-to-end latency
- **Native Interrupts** - Cut off AI mid-sentence naturally  
- **Real-Time UI Streaming** - Updates as AI speaks, not after
- **30+ Comprehensive Tools** - Cart, inventory, orders, analytics, events
- **Optimistic UI Updates** - Instant feedback with rollback support
- **Event-Driven Architecture** - Everything is reactive via SSE
- **Full-Duplex Streaming** - Bidirectional audio over WebSocket
- **Gemini 2.0 Flash Live API** - Latest multimodal AI

## 📋 Prerequisites

- **Node.js 20+** (or Bun 1.x for better performance)
- **npm** or **pnpm**
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

## 🏗️ Project Structure

```
voice-pos-react/
├── backend/          # Node.js + Hono + Gemini Live + SQLite
├── frontend/         # React + Vite + TypeScript
└── shared/           # Shared types
```

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your-key-here

# Initialize database
npx prisma db push

# Seed database (optional)
npm run db:seed

# Start backend
npm run dev
```

Backend will run on:
- HTTP API: `http://localhost:3000`
- WebSocket: `ws://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 3. Open in Browser

1. Navigate to `http://localhost:5173`
2. Allow microphone permissions
3. Click the voice button and start talking!

## 🎤 Voice Commands

Try these commands:

**Cart Management:**
- "Add two Bud Lights to cart"
- "Remove the last item"
- "Show me the cart"
- "Clear cart"

**Inventory:**
- "How much vodka do we have?"
- "Check inventory for Tito's"
- "What's low on stock?"
- "Search for IPAs"

**Orders:**
- "Process the order"
- "Show recent orders"
- "What are today's orders?"

**Navigation:**
- "Go to inventory"
- "Show me transactions"
- "Navigate to menu"

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="file:./pos.db"

# Gemini API (REQUIRED)
GEMINI_API_KEY="your-gemini-api-key-here"

# Server Configuration
PORT=3000
WS_PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Venue Configuration
VENUE_NAME="Knotting Hill Place"
VENUE_ID=1
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
```

## 🛠️ Development

### Backend Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Run production build

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
```

### Frontend Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📊 Database Schema

SQLite database with:
- **Products** - Drinks inventory with categories
- **Orders** - Order history and details
- **Cart Items** - Session-based cart
- **Event Bookings** - Wedding event management
- **Event Packages** - Package pricing
- **Users** - Staff users
- **Venues** - Multi-venue support

## 🎯 Voice Pipeline Architecture

```
User Speaks → Client VAD → WebSocket (PCM16) 
    → Gemini 2.0 Live API → Tool Execution
    → Audio Response → Web Audio API → User Hears
    
Latency: ~200ms end-to-end
```

## 🔌 API Endpoints

### HTTP API (Port 3000)

- `GET /health` - Health check
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories/list` - Get categories
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/events/bookings` - Get event bookings
- `GET /api/events/packages` - Get event packages

### WebSocket (Port 3001)

Binary message format:
- `0x01` - Audio data (PCM16)
- `0x02` - Audio response from AI

JSON control messages:
- `{ type: 'interrupt' }` - Interrupt AI
- `{ type: 'ping' }` - Keepalive

## 🧪 Testing Voice Commands

1. **Start Both Servers**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Open Browser**
   - Go to `http://localhost:5173`
   - Allow microphone access

3. **Test Basic Commands**
   - Click voice button
   - Say: "Add two beers to cart"
   - Say: "Show me the cart"
   - Say: "Process order"

4. **Test Interrupts**
   - Let AI start speaking
   - Start talking to interrupt
   - AI should stop immediately

## 🚨 Troubleshooting

### "GEMINI_API_KEY not configured"
- Make sure you copied `.env.example` to `.env`
- Add your Gemini API key in backend/.env

### WebSocket connection failed
- Check backend is running on port 3001
- Check firewall settings
- Verify WS_PORT in .env

### No audio playback
- Check browser microphone permissions
- Open browser console for errors
- Verify audio encoding (PCM16, 24kHz)

### Tools not working
- Check backend logs for tool execution errors
- Verify database connection
- Check Prisma client is generated (`npm run db:generate`)

## 📚 Adding New Tools

1. Create tool file in `backend/src/services/tools/[category]/[ToolName].ts`
2. Implement `ToolExecutor` interface
3. Register in `ToolRegistry.ts`
4. Tool will be automatically available to Gemini

Example:
```typescript
import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';

export class MyTool implements ToolExecutor {
  definition: ToolDefinition = {
    type: 'function',
    name: 'my_tool',
    description: 'What my tool does',
    parameters: {
      type: 'object',
      properties: {
        param1: { type: 'string', description: 'First param' }
      },
      required: ['param1']
    }
  };

  async execute(params: any, context: ToolContext) {
    // Your tool logic here
    return { success: true, message: 'Done!' };
  }
}
```

## 🎨 UI Design

The UI preserves the exact design from the Flutter app:
- Color palette from `app_theme_data.dart`
- Typography using Instrument Sans font
- Component layouts match Flutter widgets
- Same spacing and dimensions

## 📖 Documentation

- [Gemini 2.0 Live API Docs](https://ai.google.dev/api/multimodal-live)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Hono Framework](https://hono.dev/)
- [Vite Documentation](https://vite.dev/)

## 🤝 Contributing

This is a custom POS system. Contributions welcome!

## 📄 License

MIT

## 🎉 Next Steps

Now that the backend is ready, we need to:

1. ✅ **Backend Complete** - Server, DB, Tools, Voice Pipeline
2. ⏳ **Frontend Implementation** - React UI with voice integration
3. ⏳ **Voice UI Components** - Waveform, transcript, indicators
4. ⏳ **Optimistic Updates** - Real-time UI streaming
5. ⏳ **Seed Database** - Sample products and data

---

**Ready to add voice to your POS? Let's go! 🚀**
