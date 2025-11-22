import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger.js';
import { GeminiLiveClient } from '../services/gemini/GeminiLiveClient.js';
import { SessionManager } from './SessionManager.js';
import { v4 as uuidv4 } from 'uuid';

export class VoiceWSHandler {
    private wss: WebSocketServer;
    private sessionManager: SessionManager;
    private sessions: Map<string, { ws: WebSocket; gemini: GeminiLiveClient }> = new Map();

    constructor(wss: WebSocketServer) {
        this.wss = wss;
        this.sessionManager = new SessionManager();
    }

    initialize() {
        this.wss.on('connection', (ws: WebSocket) => {
            const sessionId = uuidv4();
            logger.info({ sessionId }, 'New WebSocket connection');

            // Initialize Gemini Live client for this session
            const geminiClient = new GeminiLiveClient(sessionId);

            this.sessions.set(sessionId, { ws, gemini: geminiClient });

            // Send session ID to client
            ws.send(JSON.stringify({
                type: 'session_created',
                sessionId,
            }));

            // Connect to Gemini
            geminiClient.connect().then(() => {
                ws.send(JSON.stringify({
                    type: 'gemini_connected',
                    message: 'Voice AI ready',
                }));
            }).catch((error) => {
                logger.error({ error, sessionId }, 'Failed to connect to Gemini');
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to initialize voice AI',
                }));
            });

            // Handle incoming messages from client
            ws.on('message', async (data: Buffer) => {
                try {
                    // Check if it's binary audio data or JSON control message
                    if (data[0] === 0x01) {
                        // Binary audio data (first byte is type marker)
                        const audioData = data.slice(1);
                        if (Math.random() < 0.01) { // Log 1% of chunks to avoid spam
                            logger.info({ size: audioData.length, sessionId }, '🎤 Received audio chunk from client');
                        }
                        await geminiClient.sendAudio(audioData);
                    } else {
                        // JSON control message
                        const message = JSON.parse(data.toString());
                        await this.handleControlMessage(sessionId, message, ws);
                    }
                } catch (error) {
                    logger.error({ error, sessionId }, 'Error handling message');
                }
            });

            // Handle Gemini responses
            geminiClient.on('audio', (audioData: Buffer) => {
                // Send audio back to client (binary format)
                const buffer = Buffer.concat([Buffer.from([0x02]), audioData]);
                ws.send(buffer);
            });

            geminiClient.on('tool_call', async (toolCall: any) => {
                logger.info({ toolCall, sessionId }, 'Tool call received');
                // Tool execution happens in GeminiLiveClient
            });

            geminiClient.on('tool_executed', (data: any) => {
                ws.send(JSON.stringify({
                    type: 'tool_executed',
                    ...data
                }));
            });

            geminiClient.on('transcript', (text: string) => {
                ws.send(JSON.stringify({
                    type: 'transcript',
                    text,
                }));
            });

            geminiClient.on('ai_response', (text: string) => {
                ws.send(JSON.stringify({
                    type: 'ai_response',
                    text,
                }));
            });

            geminiClient.on('speaking_started', () => {
                logger.info({ sessionId }, '📢 Forwarding speaking_started to frontend');
                ws.send(JSON.stringify({
                    type: 'speaking_started',
                }));
            });

            geminiClient.on('speaking_ended', () => {
                logger.info({ sessionId }, '📢 Forwarding speaking_ended to frontend');
                ws.send(JSON.stringify({
                    type: 'speaking_ended',
                }));
            });

            // Handle disconnection
            ws.on('close', () => {
                logger.info({ sessionId }, 'WebSocket connection closed');
                geminiClient.disconnect();
                this.sessions.delete(sessionId);
            });

            ws.on('error', (error) => {
                logger.error({ error, sessionId }, 'WebSocket error');
            });
        });

        logger.info('WebSocket handler initialized');
    }

    private async handleControlMessage(
        sessionId: string,
        message: any,
        ws: WebSocket
    ) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        switch (message.type) {
            case 'interrupt':
                logger.info({ sessionId }, 'User interrupted AI');
                await session.gemini.handleInterrupt();
                break;

            case 'start_listening':
                logger.info({ sessionId }, 'Start listening');
                // Client-side handles audio capture
                break;

            case 'stop_listening':
                logger.info({ sessionId }, 'Stop listening');
                break;

            case 'ping':
                ws.send(JSON.stringify({ type: 'pong' }));
                break;

            default:
                logger.warn({ message, sessionId }, 'Unknown control message');
        }
    }
}
