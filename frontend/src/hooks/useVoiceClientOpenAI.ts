import { useState, useEffect, useRef, useCallback } from 'react';
import { OpenAIRealtimeClient, RealtimeClientEvents } from '../lib/OpenAIRealtimeClient';

interface VoiceClientState {
    isConnected: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    error: string | null;
    sessionId?: string;
}

/**
 * Voice client hook using OpenAI Realtime API with WebRTC
 *
 * This replaces the Gemini-based WebSocket implementation with direct
 * peer-to-peer WebRTC connection to OpenAI's Realtime API.
 *
 * @param apiUrl - Backend URL for token generation and tool execution
 * @param onToolExecuted - Callback when a tool is executed
 */
export const useVoiceClientOpenAI = (
    apiUrl: string = 'http://localhost:3000',
    onToolExecuted?: (name: string, result: any) => void
) => {
    const [state, setState] = useState<VoiceClientState>({
        isConnected: false,
        isListening: false,
        isSpeaking: false,
        error: null,
    });

    const clientRef = useRef<OpenAIRealtimeClient | null>(null);
    const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    /**
     * Fetch tools configuration from backend
     */
    const fetchTools = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/api/realtime/tools`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tools: ${response.statusText}`);
            }
            const { tools, instructions } = await response.json();
            return { tools, instructions };
        } catch (error) {
            console.error('Failed to fetch tools:', error);
            throw error;
        }
    }, [apiUrl]);

    /**
     * Execute a tool on the backend
     */
    const executeTool = useCallback(async (name: string, args: any): Promise<any> => {
        try {
            const response = await fetch(`${apiUrl}/api/realtime/execute-tool`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    args,
                    sessionId: sessionIdRef.current,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Tool execution failed');
            }

            const { result } = await response.json();
            return result;
        } catch (error) {
            console.error('Tool execution error:', error);
            throw error;
        }
    }, [apiUrl]);

    /**
     * Connect to OpenAI Realtime API
     */
    const connect = useCallback(async () => {
        if (clientRef.current?.connected) {
            console.log('Already connected');
            return;
        }

        try {
            setState(prev => ({ ...prev, error: null }));

            // Fetch tools configuration
            const { tools, instructions } = await fetchTools();

            // Define event handlers
            const events: RealtimeClientEvents = {
                onConnected: () => {
                    console.log('✅ Connected to OpenAI Realtime API');
                    setState(prev => ({
                        ...prev,
                        isConnected: true,
                        isListening: true,
                        error: null,
                        sessionId: sessionIdRef.current,
                    }));

                    // Update cart store with session ID
                    import('../store/cartStore').then(({ useCartStore }) => {
                        useCartStore.getState().setSessionId(sessionIdRef.current);
                    });
                },

                onDisconnected: () => {
                    console.log('❌ Disconnected from OpenAI Realtime API');
                    setState(prev => ({
                        ...prev,
                        isConnected: false,
                        isListening: false,
                    }));

                    // Auto-reconnect after 3 seconds
                    setTimeout(() => {
                        console.log('🔄 Attempting to reconnect...');
                        connect();
                    }, 3000);
                },

                onError: (error) => {
                    console.error('⚠️ OpenAI Realtime API error:', error);
                    setState(prev => ({
                        ...prev,
                        error: error.message || 'Connection error',
                    }));
                },

                onAudioData: (audioData) => {
                    // Audio is handled automatically by WebRTC audio tracks
                    // This callback is for custom audio processing if needed
                },

                onTranscript: (text, isFinal) => {
                    if (isFinal) {
                        console.log('📝 Transcript:', text);
                    }
                },

                onFunctionCall: async (name, args, callId) => {
                    console.log('🛠️ Function call:', name, args);

                    try {
                        // Execute tool on backend
                        const result = await executeTool(name, args);

                        console.log('✅ Tool executed successfully:', name, result);

                        // Send result back to OpenAI
                        clientRef.current?.sendFunctionResult(callId, result);

                        // Notify app
                        if (onToolExecuted) {
                            onToolExecuted(name, result);
                        }

                        // Handle session termination
                        if (name === 'terminate_session' || name === 'end_conversation') {
                            console.log('Terminating session...');
                            disconnect();
                        }

                    } catch (error: any) {
                        console.error('❌ Tool execution failed:', error);

                        // Send error back to OpenAI
                        clientRef.current?.sendFunctionResult(callId, {
                            error: error.message || 'Tool execution failed',
                        });
                    }
                },

                onSpeakingStarted: () => {
                    console.log('🔊 AI started speaking');
                    setState(prev => ({ ...prev, isSpeaking: true }));
                },

                onSpeakingStopped: () => {
                    console.log('🔇 AI stopped speaking');
                    setState(prev => ({ ...prev, isSpeaking: false }));
                },
            };

            // Create and connect client
            const client = new OpenAIRealtimeClient(
                {
                    apiUrl,
                    voice: 'alloy', // Options: alloy, echo, shimmer, ash, ballad, coral, sage, verse
                    instructions,
                    tools,
                },
                events
            );

            await client.connect();
            clientRef.current = client;

        } catch (error: any) {
            console.error('Failed to connect to OpenAI:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to connect',
                isConnected: false,
            }));
        }
    }, [apiUrl, fetchTools, executeTool, onToolExecuted]);

    /**
     * Disconnect from OpenAI
     */
    const disconnect = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
            clientRef.current = null;
        }
        setState(prev => ({
            ...prev,
            isConnected: false,
            isListening: false,
            isSpeaking: false,
        }));
    }, []);

    /**
     * Interrupt the AI's current response
     */
    const interrupt = useCallback(() => {
        if (clientRef.current) {
            console.log('⏸️ Interrupting AI response');
            clientRef.current.interrupt();
        }
    }, []);

    /**
     * Toggle listening state (for UI purposes - WebRTC is always listening)
     */
    const toggleListening = useCallback(() => {
        if (!state.isConnected) {
            connect();
        } else {
            // With WebRTC, we're always listening when connected
            // This is mainly for UI state management
            setState(prev => ({ ...prev, isListening: !prev.isListening }));
        }
    }, [state.isConnected, connect]);

    /**
     * Auto-connect on mount
     */
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        ...state,
        connect,
        disconnect,
        interrupt,
        toggleListening,
    };
};
