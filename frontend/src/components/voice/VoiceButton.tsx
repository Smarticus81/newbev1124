
import { theme } from '../../styles/theme';

interface VoiceButtonProps {
    voiceClient: any;
}

const VoiceButton = ({ voiceClient }: VoiceButtonProps) => {
    const { isConnected, isListening, isSpeaking, startListening, stopListening, error } = voiceClient;

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={handleClick}
                disabled={!isConnected}
                style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: isListening ? theme.brand.lager : (isConnected ? theme.neutral[0] : theme.neutral[200]),
                    border: `2px solid ${isSpeaking ? theme.brand.pine : theme.neutral[300]}`,
                    boxShadow: theme.shadows.large,
                    cursor: isConnected ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isListening ? 'scale(1.1)' : 'scale(1)',
                    opacity: isConnected ? 1 : 0.7,
                }}
                className="no-select"
                aria-label="Voice control"
                title={error || (isConnected ? "Click to speak" : "Connecting...")}
            >
                {/* Microphone icon */}
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill={isListening ? theme.neutral[0] : theme.brand.pine}
                >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>

                {/* Listening animation */}
                {isListening && (
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: `2px solid ${theme.brand.lager}`,
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                )}

                {/* Speaking animation (ring) */}
                {isSpeaking && (
                    <div
                        style={{
                            position: 'absolute',
                            width: '110%',
                            height: '110%',
                            borderRadius: '50%',
                            border: `3px solid ${theme.brand.pine}`,
                            animation: 'spin 2s linear infinite',
                            borderTopColor: 'transparent',
                        }}
                    />
                )}

                <style>{`
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 1;
              }
              100% {
                transform: scale(1.4);
                opacity: 0;
              }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
          `}</style>
            </button>
            {error && (
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    color: theme.red[500],
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default VoiceButton;
