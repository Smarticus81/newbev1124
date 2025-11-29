import { Hono } from 'hono';
import { logger } from '../utils/logger.js';
import OpenAI from 'openai';
import { ToolRegistry } from '../services/tools/ToolRegistry.js';
import { ToolContext } from '../services/tools/types.js';
import { SYSTEM_PROMPT } from '../config/systemPrompt.js';

export const realtimeRoutes = new Hono();

// Tool registry instance
const toolRegistry = new ToolRegistry();

// OpenAI Realtime API ephemeral token generation
realtimeRoutes.post('/session', async (c) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            logger.error('OPENAI_API_KEY not configured');
            return c.json({ error: 'OpenAI API key not configured' }, 500);
        }

        const openai = new OpenAI({ apiKey });

        // Get session configuration from request or use defaults
        const body = await c.req.json().catch(() => ({}));
        const model = body.model || process.env.OPENAI_MODEL || 'gpt-4o-realtime-preview-2024-12-17';
        const voice = body.voice || 'alloy';
        const instructions = body.instructions;

        logger.info({ model, voice }, 'Creating OpenAI Realtime session');

        // Create ephemeral token for WebRTC connection
        // This token is valid for 60 seconds
        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                voice,
                ...(instructions && { instructions }),
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            logger.error({ error, status: response.status }, 'Failed to create OpenAI session');
            return c.json({ error: 'Failed to create session' }, response.status);
        }

        const data = await response.json();

        logger.info({
            client_secret: data.client_secret ? 'present' : 'missing',
            expires_at: data.expires_at
        }, 'OpenAI session created successfully');

        // Return ephemeral token and session config
        return c.json({
            client_secret: data.client_secret,
            expires_at: data.expires_at,
            session_id: data.id,
            model: data.model,
            voice: data.voice,
        });

    } catch (error: any) {
        logger.error({ error: error.message }, 'Error creating OpenAI session');
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// Get tools configuration for OpenAI session
realtimeRoutes.get('/tools', (c) => {
    const tools = toolRegistry.toOpenAITools();
    return c.json({
        tools,
        instructions: SYSTEM_PROMPT,
    });
});

// Execute tool (called from frontend after function call)
realtimeRoutes.post('/execute-tool', async (c) => {
    try {
        const { name, args, sessionId } = await c.req.json();

        if (!name || !args || !sessionId) {
            return c.json({ error: 'Missing required fields: name, args, sessionId' }, 400);
        }

        // Create tool context
        const context: ToolContext = {
            sessionId,
            venueId: parseInt(process.env.VENUE_ID || '1'),
        };

        // Execute tool
        logger.info({ name, args, sessionId }, 'Executing tool from frontend');
        const result = await toolRegistry.execute(name, args, context);

        logger.info({ name, result, sessionId }, 'Tool executed successfully');

        return c.json({
            success: true,
            result,
        });

    } catch (error: any) {
        logger.error({ error: error.message }, 'Error executing tool');
        return c.json({ error: error.message }, 500);
    }
});

// Health check endpoint
realtimeRoutes.get('/health', (c) => {
    return c.json({ status: 'ok', service: 'openai-realtime' });
});
