import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceClientState {
    isConnected: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    error: string | null;
    sessionId?: string;
    mode: 'wake_word' | 'command';
}

// Levenshtein Distance Implementation
function levenshtein(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

const WORKLET_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.targetSampleRate = 24000;
        this.accumulator = [];
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input.length) return true;
        const channel = input[0];
        
        for (let i = 0; i < channel.length; i++) {
            this.accumulator.push(channel[i]);
        }
        
        // Process every 4096 input samples to match previous latency/chunk size roughly
        const chunkSize = 4096;
        
        if (this.accumulator.length >= chunkSize) {
            const chunk = this.accumulator.splice(0, chunkSize);
            const pcmData = this.downsample(chunk, sampleRate, this.targetSampleRate);
            this.port.postMessage(pcmData);
        }
        
        return true;
    }
    
    downsample(inputData, currentRate, targetRate) {
        if (currentRate === targetRate) {
            return this.floatTo16BitPCM(inputData);
        }
        const ratio = currentRate / targetRate;
        const newLength = Math.floor(inputData.length / ratio);
        const pcmData = new Int16Array(newLength);
        
        for (let i = 0; i < newLength; i++) {
            const startOffset = Math.floor(i * ratio);
            const endOffset = Math.floor((i + 1) * ratio);
            let sum = 0;
            let count = 0;
            for (let j = startOffset; j < endOffset && j < inputData.length; j++) {
                sum += inputData[j];
                count++;
            }
            const avg = count > 0 ? sum / count : 0;
            pcmData[i] = Math.max(-1, Math.min(1, avg)) * 0x7FFF;
        }
        return pcmData;
    }
    
    floatTo16BitPCM(inputData) {
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        return pcmData;
    }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

export const useVoiceClient = (url: string = 'ws://localhost:3001', onToolExecuted?: (name: string, result: any) => void) => {
    const [state, setState] = useState<VoiceClientState>({
        isConnected: false,
        isListening: false,
        isSpeaking: false,
        error: null,
        mode: 'wake_word', // Default to wake word mode
    });

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const audioQueueRef = useRef<Float32Array[]>([]);
    const nextStartTimeRef = useRef(0);
    const isSpeakingRef = useRef(false);
    const recognitionRef = useRef<any>(null);

    // Initialize Audio Context
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(e => console.error("Failed to resume audio context:", e));
        }
    }, []);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
            return;
        }

        try {
            console.log('Initiating WebSocket connection to', url);
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ Connected to Voice Backend at', url);
                setState(prev => ({ ...prev, isConnected: true, error: null }));
            };

            ws.onclose = (event) => {
                console.log('❌ Disconnected from Voice Backend', event.code, event.reason);
                setState(prev => ({ ...prev, isConnected: false, isListening: false }));

                if (wsRef.current === ws) {
                    wsRef.current = null;
                    setTimeout(() => {
                        console.log('🔄 Attempting to reconnect...');
                        connect();
                    }, 3000);
                }
            };

            ws.onerror = (event) => {
                console.error('⚠️ WebSocket error:', event);
                setState(prev => ({ ...prev, error: 'Connection error' }));
            };

            ws.onmessage = async (event) => {
                const data = event.data;

                if (data instanceof Blob) {
                    const arrayBuffer = await data.arrayBuffer();
                    const view = new Uint8Array(arrayBuffer);
                    if (view[0] === 0x02) {
                        const audioData = arrayBuffer.slice(1);
                        handleIncomingAudio(audioData);
                    }
                } else {
                    try {
                        const message = JSON.parse(data);
                        handleControlMessage(message);
                    } catch (e) {
                        console.error('Failed to parse message:', e);
                    }
                }
            };
        } catch (err) {
            console.error('Failed to create WebSocket:', err);
            setState(prev => ({ ...prev, error: 'Failed to connect' }));
        }
    }, [url]);

    const handleControlMessage = (message: any) => {
        switch (message.type) {
            case 'session_created':
                setState(prev => ({ ...prev, sessionId: message.sessionId }));
                import('../store/cartStore').then(({ useCartStore }) => {
                    useCartStore.getState().setSessionId(message.sessionId);
                });
                break;
            case 'speaking_started':
                console.log('🔊 Frontend received: SPEAKING STARTED');
                setState(prev => ({ ...prev, isSpeaking: true }));
                isSpeakingRef.current = true;
                // Pause recognition if in command mode?
                // Actually, in command mode we stream everything, so we rely on AEC.
                break;
            case 'speaking_ended':
                console.log('🔇 Frontend received: SPEAKING ENDED');
                setState(prev => ({ ...prev, isSpeaking: false }));
                isSpeakingRef.current = false;
                break;
            case 'tool_executed':
                console.log('🛠️ Tool executed:', message.name, message.result);
                if (onToolExecuted) {
                    onToolExecuted(message.name, message.result);
                }
                // Check for termination
                if (message.name === 'terminate_session' || message.name === 'end_conversation') {
                    console.log("Terminating session, switching to Wake Word mode");
                    switchToWakeWordMode();
                }
                break;
            case 'error':
                setState(prev => ({ ...prev, error: message.message }));
                break;
            default:
                break;
        }
    };

    const handleIncomingAudio = async (arrayBuffer: ArrayBuffer) => {
        initAudioContext();
        if (!audioContextRef.current) return;

        const int16Data = new Int16Array(arrayBuffer);
        const float32Data = new Float32Array(int16Data.length);

        for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 32768.0;
        }

        audioQueueRef.current.push(float32Data);
        playNextInQueue();
    };

    const playNextInQueue = () => {
        if (!audioContextRef.current || audioQueueRef.current.length === 0) return;

        const audioCtx = audioContextRef.current;
        const audioData = audioQueueRef.current.shift();
        if (!audioData) return;

        const buffer = audioCtx.createBuffer(1, audioData.length, 24000);
        buffer.getChannelData(0).set(audioData);

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);

        const currentTime = audioCtx.currentTime;
        if (nextStartTimeRef.current < currentTime) {
            nextStartTimeRef.current = currentTime;
        }

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += buffer.duration;

        source.onended = () => {
            if (audioQueueRef.current.length > 0) {
                playNextInQueue();
            }
        };
    };

    // --- Wake Word Logic ---

    const startWakeWordDetection = () => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Speech Recognition not supported");
            // Fallback: just go to command mode
            switchToCommandMode();
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.start();
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const transcript = event.results[i][0].transcript.trim().toLowerCase();
                    console.log("Wake Word Transcript:", transcript);

                    if (checkWakeWord(transcript)) {
                        console.log("✅ Wake Word Detected!");
                        recognition.stop();
                        switchToCommandMode();
                    }
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                setState(prev => ({ ...prev, error: 'Microphone access denied for wake word' }));
            }
        };

        recognition.onend = () => {
            // Restart if we are still in wake word mode
            if (state.mode === 'wake_word' && state.isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    // Ignore
                }
            }
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
        } catch (e) {
            console.error("Failed to start recognition", e);
        }
    };

    const checkWakeWord = (text: string) => {
        const target = "hey bev";
        // Check if text contains "hey bev"
        if (text.includes(target)) return true;

        // Check Levenshtein distance on the whole text or words?
        // Simple check: distance <= 3
        const dist = levenshtein(text, target);
        return dist <= 3;
    };

    const switchToCommandMode = async () => {
        console.log("Switching to COMMAND mode");
        setState(prev => ({ ...prev, mode: 'command' }));

        // Stop recognition
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        // Start Audio Streaming
        await startAudioStreaming();

        // Optional: Play "I'm listening" sound or cue
    };

    const switchToWakeWordMode = () => {
        console.log("Switching to WAKE WORD mode");
        setState(prev => ({ ...prev, mode: 'wake_word' }));

        // Stop Audio Streaming
        stopAudioStreaming();

        // Start Recognition
        startWakeWordDetection();
    };

    // --- Audio Streaming Logic ---

    const startAudioStreaming = async () => {
        initAudioContext();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    autoGainControl: true,
                    noiseSuppression: true,
                }
            });

            mediaStreamRef.current = stream;

            if (!audioContextRef.current) return;
            const audioCtx = audioContextRef.current;
            const source = audioCtx.createMediaStreamSource(stream);

            // Setup AudioWorklet
            const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
            const workletUrl = URL.createObjectURL(blob);

            try {
                await audioCtx.audioWorklet.addModule(workletUrl);
                const workletNode = new AudioWorkletNode(audioCtx, 'pcm-processor');
                workletNodeRef.current = workletNode;

                workletNode.port.onmessage = (event) => {
                    const pcmData = event.data; // Int16Array

                    // Don't send audio while AI is speaking
                    if (isSpeakingRef.current) return;

                    const msg = new Uint8Array(1 + pcmData.byteLength);
                    msg[0] = 0x01;
                    msg.set(new Uint8Array(pcmData.buffer), 1);

                    if (wsRef.current?.readyState === WebSocket.OPEN) {
                        wsRef.current.send(msg);
                    }
                };

                source.connect(workletNode);
                workletNode.connect(audioCtx.destination); // Keep alive
            } catch (e) {
                console.error("Failed to load AudioWorklet:", e);
            }

        } catch (err) {
            console.error('Error accessing microphone:', err);
            setState(prev => ({ ...prev, error: 'Microphone access denied' }));
        }
    };

    const stopAudioStreaming = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }
    };

    const startListening = async () => {
        setState(prev => ({ ...prev, isListening: true }));
        // Start in Wake Word mode
        startWakeWordDetection();
    };

    const stopListening = () => {
        stopAudioStreaming();
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setState(prev => ({ ...prev, isListening: false }));
    };

    const disconnect = useCallback(() => {
        stopListening();
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return {
        ...state,
        startListening,
        stopListening,
    };
};
