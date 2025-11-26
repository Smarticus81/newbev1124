# BevPro Voice POS - Frontend

React + Vite frontend for the BevPro Voice-Controlled Point of Sale system.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Deploy to Vercel

```bash
# From project root
./deploy-vercel.sh
```

Or manually:

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add VITE_WS_URL
vercel env add VITE_CONVEX_URL

# Deploy to production
vercel --prod
```

See `../VERCEL_DEPLOYMENT.md` for detailed instructions.

## Environment Variables

Create a `.env` file (optional, for local overrides):

```env
VITE_WS_URL=ws://localhost:3001
VITE_CONVEX_URL=https://impartial-orca-713.convex.cloud
```

### Environment Variables for Deployment

- `VITE_WS_URL`: Backend WebSocket URL
  - Development: `ws://localhost:3001`
  - Production: `wss://your-backend.com` (auto-detected if not set)
  
- `VITE_CONVEX_URL`: Convex database URL
  - Default: `https://impartial-orca-713.convex.cloud`

## Architecture

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.2
- **State Management**: Zustand 5.0.8
- **Database**: Convex (real-time)
- **Styling**: Inline styles with theme system
- **Voice**: WebSocket connection to backend

## Features

- Voice-controlled interface with wake word detection
- Real-time cart management
- Product catalog with categories
- Order management (tabs)
- Transaction history
- Inventory viewing
- Settings and voice configuration

## Project Structure

```
frontend/
├── public/           # Static assets
│   ├── drink_images/ # Product images
│   └── images/       # UI images
├── src/
│   ├── components/   # React components
│   │   ├── cart/     # Cart components
│   │   ├── common/   # Shared components
│   │   ├── layout/   # Layout components
│   │   ├── products/ # Product components
│   │   └── voice/    # Voice button
│   ├── hooks/        # Custom hooks
│   ├── screens/      # Main screens
│   ├── store/        # Zustand state
│   ├── styles/       # Theme and styles
│   └── types/        # TypeScript types
├── convex/           # Convex generated files (auto-copied)
├── package.json
├── vercel.json       # Vercel configuration
└── vite.config.ts    # Vite configuration
```

## Development Notes

### Convex Integration

The frontend imports Convex generated types from `convex/_generated/`. These files are automatically copied from `../backend/convex/_generated/` during the build process.

If you see TypeScript errors related to Convex imports:

```bash
# Manually copy Convex files
npm run prebuild
```

### WebSocket Connection

The app automatically determines the WebSocket URL:
- **Development**: `ws://localhost:3001`
- **Production**: Uses same host as HTTP (auto-detected)
- **Custom**: Set `VITE_WS_URL` environment variable

### Voice Features

The voice system uses:
- Web Speech Recognition API (wake word detection)
- WebSocket (full-duplex audio streaming)
- AudioWorklet (audio processing)

Wake word: "Hey Bev"

## Troubleshooting

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

### WebSocket Connection Failed

1. Check backend is running
2. Verify `VITE_WS_URL` is correct
3. Check browser console for errors
4. Verify CORS settings on backend

### Convex Errors

```bash
# Ensure backend Convex files are generated
cd ../backend
npx convex dev

# Copy to frontend
cd ../frontend
npm run prebuild
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run prebuild` - Copy Convex generated files

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Requires:
  - WebSocket support
  - Web Audio API
  - AudioWorklet API
  - Web Speech Recognition API (for wake word)

## Contributing

This is a custom POS system. See main README for contribution guidelines.

## License

MIT
