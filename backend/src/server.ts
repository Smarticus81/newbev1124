import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from '@hono/node-server/serve-static';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { VoiceWSHandler } from './websocket/VoiceWSHandler.js';
import { logger } from './utils/logger.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
import { eventRoutes } from './routes/events.js';
import { realtimeRoutes } from './routes/realtime.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env first
dotenv.config();
console.log('Loaded .env, OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);

// Manually load .env.local if it exists (overriding .env)
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    console.log('.env.local exists, loading it...');
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    console.log('.env.local keys:', Object.keys(envConfig));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log('After .env.local, OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
} else {
    console.log('.env.local does not exist');
}

const app = new Hono();

// CORS configuration
app.use('/*', cors({
    origin: (origin) => {
        if (!origin) return process.env.FRONTEND_URL || 'http://localhost:5173';
        if (origin.startsWith('http://localhost:') || origin === process.env.FRONTEND_URL) {
            return origin;
        }
        return process.env.FRONTEND_URL || 'http://localhost:5173';
    },
    credentials: true,
}));

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.route('/api/products', productRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/events', eventRoutes);
app.route('/api/realtime', realtimeRoutes);

// SSE for real-time UI updates
app.get('/api/events/stream', async (c) => {
    const sessionId = c.req.query('session');

    if (!sessionId) {
        return c.json({ error: 'Session ID required' }, 400);
    }

    return c.newResponse(
        new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder();

                // Send initial connection message
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`)
                );

                // Keep connection alive
                const keepAlive = setInterval(() => {
                    controller.enqueue(encoder.encode(':keepalive\n\n'));
                }, 30000);

                // Cleanup on close
                c.req.raw.signal.addEventListener('abort', () => {
                    clearInterval(keepAlive);
                    controller.close();
                });
            },
        }),
        {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        }
    );
});

// Serve static frontend files in production
// In production, frontend/dist contents are copied to backend/dist/frontend/
const frontendDistPath = path.join(__dirname, '../frontend');
logger.info({ path: frontendDistPath, exists: fs.existsSync(frontendDistPath) }, 'Checking frontend dist path');

if (fs.existsSync(frontendDistPath)) {
    logger.info({ path: frontendDistPath }, 'Serving frontend static files');
    
    // Serve static assets with correct root path (relative to cwd)
    app.use('/assets/*', serveStatic({ root: './dist/frontend' }));
    app.use('/drink_images/*', serveStatic({ root: './dist/frontend' }));
    app.use('/drinks/*', serveStatic({ root: './dist/frontend' }));
    app.use('/images/*', serveStatic({ root: './dist/frontend' }));
    app.use('/favicon.ico', serveStatic({ root: './dist/frontend', path: '/favicon.ico' }));
    app.use('/vite.svg', serveStatic({ root: './dist/frontend', path: '/vite.svg' }));
    
    // SPA fallback - serve index.html for all non-API routes
    app.get('*', async (c) => {
        // Skip API routes
        if (c.req.path.startsWith('/api/') || c.req.path === '/health') {
            return c.notFound();
        }
        const indexPath = path.join(frontendDistPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            const html = fs.readFileSync(indexPath, 'utf-8');
            return c.html(html);
        }
        return c.notFound();
    });
} else {
    logger.warn({ path: frontendDistPath }, 'Frontend dist not found - API only mode');
}

const PORT = parseInt(process.env.PORT || '3000');

// Create HTTP server first
const httpServer = createServer();

// Attach Hono app to handle HTTP requests
httpServer.on('request', async (req, res) => {
    const url = `http://${req.headers.host || 'localhost'}${req.url}`;
    
    // Convert Node.js headers to Web API Headers
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
            if (Array.isArray(value)) {
                value.forEach(v => headers.append(key, v));
            } else {
                headers.set(key, value);
            }
        }
    });
    
    // Handle request body for POST/PUT/PATCH requests
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        body = await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }
    
    const request = new Request(url, {
        method: req.method,
        headers: headers,
        body: body,
    });

    const response = await app.fetch(request);
    
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
        res.setHeader(key, value);
    });
    
    if (response.body) {
        const reader = response.body.getReader();
        const pump = async (): Promise<void> => {
            const { done, value } = await reader.read();
            if (done) {
                res.end();
                return;
            }
            res.write(value);
            await pump();
        };
        await pump();
    } else {
        res.end();
    }
});

// Attach WebSocket server to the same HTTP server
const wss = new WebSocketServer({ server: httpServer });

const voiceHandler = new VoiceWSHandler(wss);
voiceHandler.initialize();

// Start the server
httpServer.listen(PORT, () => {
    logger.info(`HTTP server listening on port ${PORT}`);
    logger.info(`WebSocket server listening on port ${PORT}`);
    logger.info(`Voice POS backend ready!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    wss.close();
    httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
