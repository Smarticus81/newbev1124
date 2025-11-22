import { GoogleGenAI, Modality } from '@google/genai';
import { EventEmitter } from 'events';
import { logger } from '../../utils/logger.js';
import { ToolRegistry } from '../tools/ToolRegistry.js';
import { ToolContext } from '../tools/types.js';
import { SYSTEM_PROMPT } from '../../config/systemPrompt.js';

export class GeminiLiveClient extends EventEmitter {
    private session: any = null;
    private sessionId: string;
    private toolRegistry: ToolRegistry;
    private isConnected = false;
    private isSpeaking = false;
    private ai: any;

    constructor(sessionId: string) {
        super();
        this.sessionId = sessionId;
        this.toolRegistry = new ToolRegistry();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        this.ai = new GoogleGenAI({ apiKey });
    }

    async connect() {
        const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

        const config = {
            responseModalities: [Modality.AUDIO],
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            tools: this.toolRegistry.toGeminiTools()
        };

        try {
            this.session = await this.ai.live.connect({
                model: model,
                config: config,
                callbacks: {
                    onopen: () => {
                        logger.info({ sessionId: this.sessionId }, 'Connected to Gemini Live API');
                        this.isConnected = true;
                        this.emit('connected');
                    },
                    onmessage: (message: any) => {
                        this.handleGeminiMessage(message);
                    },
                    onerror: (error: any) => {
                        logger.error({
                            error: error.message,
                            sessionId: this.sessionId
                        }, 'Gemini Live API error');
                        this.emit('error', error);
                    },
                    onclose: (event: any) => {
                        logger.info({
                            reason: event.reason,
                            sessionId: this.sessionId
                        }, 'Gemini connection closed');
                        this.isConnected = false;
                        this.emit('disconnected');
                    },
                },
            });

            return true;
        } catch (error: any) {
            logger.error({
                error: error.message,
                sessionId: this.sessionId
            }, 'Failed to connect to Gemini');
            throw error;
        }
    }

    async sendAudio(audioData: Buffer) {
        if (!this.session || !this.isConnected) {
            logger.warn({ sessionId: this.sessionId }, 'Cannot send audio: not connected');
            return;
        }

        try {
            // Convert Buffer to base64
            const base64Audio = audioData.toString('base64');

            this.session.sendRealtimeInput({
                audio: {
                    data: base64Audio,
                    mimeType: 'audio/pcm;rate=24000'
                }
            });
        } catch (error: any) {
            logger.error({
                error: error.message,
                sessionId: this.sessionId
            }, 'Error sending audio');
        }
    }

    private async handleGeminiMessage(message: any) {
        try {
            // Handle text response
            if (message.text) {
                logger.info({ text: message.text, sessionId: this.sessionId }, '💬 AI text response');
                this.emit('ai_response', message.text);
            }

            // **CRITICAL FIX**: Handle TOP-LEVEL toolCall messages
            if (message.toolCall?.functionCalls) {
                logger.info({ count: message.toolCall.functionCalls.length, sessionId: this.sessionId }, '🔧🔧🔧 TOP-LEVEL Tool calls! (THIS WAS MISSING!)');
                for (const functionCall of message.toolCall.functionCalls) {
                    await this.handleToolCall(functionCall);
                }
            }

            // Handle function calls (legacy location)
            if (message.functionCalls) {
                logger.info({ count: message.functionCalls.length, sessionId: this.sessionId }, '🔧 Function calls in message');
                for (const functionCall of message.functionCalls) {
                    await this.handleToolCall(functionCall);
                }
            }

            // Handle server content
            if (message.serverContent) {
                // Handle turn complete
                if (message.serverContent.turnComplete) {
                    if (this.isSpeaking) {
                        this.isSpeaking = false;
                        logger.info({ sessionId: this.sessionId }, '🔇 SPEAKING ENDED (turnComplete)');
                        this.emit('speaking_ended');
                    }
                }

                // Handle interruption
                if (message.serverContent.interrupted) {
                    logger.info({ sessionId: this.sessionId }, '⚠️ Interrupted');
                    this.isSpeaking = false;
                    this.emit('interrupted');
                }

                // Handle model turn with parts
                if (message.serverContent.modelTurn?.parts) {
                    for (const part of message.serverContent.modelTurn.parts) {
                        // Audio response
                        if (part.inlineData?.mimeType?.includes('audio')) {
                            if (!this.isSpeaking) {
                                this.isSpeaking = true;
                                logger.info({ sessionId: this.sessionId }, '🔊 SPEAKING STARTED');
                                this.emit('speaking_started');
                            }

                            const audioData = Buffer.from(part.inlineData.data, 'base64');
                            this.emit('audio', audioData);
                        }

                        // Text response  
                        if (part.text) {
                            // Filter out internal monologues
                            if (part.text.includes('Observing the Environment') || part.text.startsWith('**Observing')) {
                                continue;
                            }

                            this.emit('ai_response', part.text);
                        }

                        // Function call  
                        if (part.functionCall) {
                            await this.handleToolCall(part.functionCall);
                        }
                    }
                }
            }
        } catch (error: any) {
            logger.error({
                error: error.message,
                sessionId: this.sessionId
            }, 'Error handling Gemini message');
        }
    }

    private async handleToolCall(functionCall: any) {
        const { name, args } = functionCall;

        logger.info({ name, args, sessionId: this.sessionId }, '🛠️ Executing tool');

        try {
            // Create tool context
            const context: ToolContext = {
                sessionId: this.sessionId,
                venueId: parseInt(process.env.VENUE_ID || '1'),
            };

            // Execute tool
            const result = await this.toolRegistry.execute(name, args, context);

            // Send function response back to Gemini
            this.session.sendToolResponse({
                functionResponses: [{
                    id: functionCall.id || name,
                    name: name,
                    response: {
                        output: result
                    }
                }]
            });

            logger.info({ name, result, sessionId: this.sessionId }, '✅ Tool executed successfully');
            this.emit('tool_executed', { name, result });

        } catch (error: any) {
            logger.error({
                error: error.message,
                name,
                args,
                sessionId: this.sessionId
            }, '❌ Tool execution failed');

            // Send error response to Gemini
            this.session.sendToolResponse({
                functionResponses: [{
                    id: functionCall.id || name,
                    name: name,
                    response: {
                        error: error.message || 'Tool execution failed'
                    }
                }]
            });
        }
    }

    async handleInterrupt() {
        if (!this.session || !this.isConnected) return;

        // Stop current audio generation
        this.isSpeaking = false;
        this.emit('speaking_ended');

        logger.info({ sessionId: this.sessionId }, 'Interrupt handled');
    }

    disconnect() {
        if (this.session) {
            this.session.close();
            this.session = null;
        }
        this.isConnected = false;
    }
}
