/**
 * OpenAI Realtime API WebRTC Client
 *
 * Implements WebRTC peer-to-peer connection with OpenAI's Realtime API
 * Handles audio streaming, data channel communication, and function calling
 */

export interface RealtimeClientConfig {
    apiUrl: string; // Backend URL for ephemeral token generation
    model?: string;
    voice?: 'alloy' | 'echo' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';
    instructions?: string;
    tools?: any[];
}

export interface RealtimeClientEvents {
    onConnected: () => void;
    onDisconnected: () => void;
    onError: (error: Error) => void;
    onAudioData: (audioData: Int16Array) => void;
    onTranscript: (text: string, isFinal: boolean) => void;
    onFunctionCall: (name: string, args: any, callId: string) => void;
    onSpeakingStarted: () => void;
    onSpeakingStopped: () => void;
}

export class OpenAIRealtimeClient {
    private config: RealtimeClientConfig;
    private events: RealtimeClientEvents;
    private peerConnection: RTCPeerConnection | null = null;
    private dataChannel: RTCDataChannel | null = null;
    private audioContext: AudioContext | null = null;
    private isConnected = false;
    private isSpeaking = false;

    constructor(config: RealtimeClientConfig, events: RealtimeClientEvents) {
        this.config = config;
        this.events = events;
    }

    /**
     * Connect to OpenAI Realtime API via WebRTC
     */
    async connect(): Promise<void> {
        try {
            // Step 1: Get ephemeral token from backend
            const tokenResponse = await fetch(`${this.config.apiUrl}/api/realtime/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.config.model,
                    voice: this.config.voice,
                    instructions: this.config.instructions,
                }),
            });

            if (!tokenResponse.ok) {
                throw new Error(`Failed to get ephemeral token: ${tokenResponse.statusText}`);
            }

            const data = await tokenResponse.json();
            // client_secret is an object with a 'value' field containing the ephemeral token
            const ephemeralToken = data.client_secret?.value || data.client_secret;

            // Step 2: Create RTCPeerConnection
            this.peerConnection = new RTCPeerConnection();

            // Step 3: Set up audio handling
            await this.setupAudio();

            // Step 4: Create data channel for bidirectional communication
            this.dataChannel = this.peerConnection.createDataChannel('oai-events');
            this.setupDataChannel();

            // Step 5: Add local microphone audio track
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => {
                this.peerConnection!.addTrack(track, stream);
            });

            // Step 6: Handle remote audio tracks from OpenAI
            this.peerConnection.ontrack = (event) => {
                console.log('Received remote audio track from OpenAI');
                const remoteStream = event.streams[0];

                // Create audio element to play the response
                const audioEl = new Audio();
                audioEl.autoplay = true;
                audioEl.srcObject = remoteStream;
            };

            // Step 7: Create SDP offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // Step 8: Send offer to OpenAI and get answer
            const sdpResponse = await fetch('https://api.openai.com/v1/realtime', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ephemeralToken}`,
                    'Content-Type': 'application/sdp',
                },
                body: offer.sdp,
            });

            if (!sdpResponse.ok) {
                throw new Error(`Failed to connect to OpenAI: ${sdpResponse.statusText}`);
            }

            const answerSdp = await sdpResponse.text();
            await this.peerConnection.setRemoteDescription({
                type: 'answer',
                sdp: answerSdp,
            });

            this.isConnected = true;
            console.log('Connected to OpenAI Realtime API via WebRTC');
            this.events.onConnected();

        } catch (error) {
            console.error('Failed to connect to OpenAI Realtime API:', error);
            this.events.onError(error as Error);
            throw error;
        }
    }

    /**
     * Set up audio context and worklet for processing
     */
    private async setupAudio(): Promise<void> {
        this.audioContext = new AudioContext({ sampleRate: 24000 });

        // Note: Audio worklet setup would go here for custom audio processing
        // For now, we'll rely on the browser's built-in audio handling
    }

    /**
     * Set up data channel for sending/receiving events
     */
    private setupDataChannel(): void {
        if (!this.dataChannel) return;

        this.dataChannel.onopen = () => {
            console.log('Data channel opened');

            // Send session update with tools configuration
            if (this.config.tools && this.config.tools.length > 0) {
                this.sendEvent({
                    type: 'session.update',
                    session: {
                        tools: this.config.tools,
                        tool_choice: 'auto',
                    },
                });
            }
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleRealtimeEvent(message);
            } catch (error) {
                console.error('Failed to parse data channel message:', error);
            }
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
            this.events.onError(new Error('Data channel error'));
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            this.isConnected = false;
            this.events.onDisconnected();
        };
    }

    /**
     * Handle events from OpenAI Realtime API
     */
    private handleRealtimeEvent(event: any): void {
        console.log('Received event:', event.type);

        switch (event.type) {
            case 'session.created':
            case 'session.updated':
                console.log('Session configured:', event);
                break;

            case 'conversation.item.created':
                // New conversation item (user or assistant message)
                break;

            case 'response.audio_transcript.delta':
                // Streaming transcript from the assistant
                this.events.onTranscript(event.delta, false);
                break;

            case 'response.audio_transcript.done':
                // Final transcript
                this.events.onTranscript(event.transcript, true);
                break;

            case 'response.audio.delta':
                // Audio chunk from the assistant (handled via WebRTC audio track)
                if (!this.isSpeaking) {
                    this.isSpeaking = true;
                    this.events.onSpeakingStarted();
                }
                break;

            case 'response.audio.done':
                // Audio response complete
                if (this.isSpeaking) {
                    this.isSpeaking = false;
                    this.events.onSpeakingStopped();
                }
                break;

            case 'response.function_call_arguments.delta':
                // Streaming function call arguments
                break;

            case 'response.function_call_arguments.done':
                // Function call complete, execute it
                const { call_id, name, arguments: argsStr } = event;
                try {
                    const args = JSON.parse(argsStr);
                    this.events.onFunctionCall(name, args, call_id);
                } catch (error) {
                    console.error('Failed to parse function arguments:', error);
                }
                break;

            case 'input_audio_buffer.speech_started':
                // User started speaking
                console.log('User speech started');
                break;

            case 'input_audio_buffer.speech_stopped':
                // User stopped speaking
                console.log('User speech stopped');
                break;

            case 'response.done':
                console.log('Response complete');
                break;

            case 'error':
                console.error('OpenAI error:', event);
                this.events.onError(new Error(event.error?.message || 'Unknown error'));
                break;

            default:
                console.log('Unhandled event type:', event.type);
        }
    }

    /**
     * Send an event to OpenAI via data channel
     */
    private sendEvent(event: any): void {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
            console.warn('Cannot send event: data channel not open');
            return;
        }

        try {
            this.dataChannel.send(JSON.stringify(event));
        } catch (error) {
            console.error('Failed to send event:', error);
        }
    }

    /**
     * Send function call result back to OpenAI
     */
    sendFunctionResult(callId: string, result: any): void {
        this.sendEvent({
            type: 'conversation.item.create',
            item: {
                type: 'function_call_output',
                call_id: callId,
                output: JSON.stringify(result),
            },
        });

        // Trigger response generation
        this.sendEvent({
            type: 'response.create',
        });
    }

    /**
     * Interrupt the current response
     */
    interrupt(): void {
        this.sendEvent({
            type: 'response.cancel',
        });

        if (this.isSpeaking) {
            this.isSpeaking = false;
            this.events.onSpeakingStopped();
        }
    }

    /**
     * Disconnect from OpenAI
     */
    disconnect(): void {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.isConnected = false;
        console.log('Disconnected from OpenAI Realtime API');
    }

    /**
     * Check if connected
     */
    get connected(): boolean {
        return this.isConnected;
    }

    /**
     * Check if currently speaking
     */
    get speaking(): boolean {
        return this.isSpeaking;
    }
}
