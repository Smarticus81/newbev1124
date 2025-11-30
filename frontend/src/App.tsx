import { useState, useCallback } from 'react';
import './style.css';
import { theme } from './styles/theme';
import ProductsScreen from './screens/ProductsScreen';
import SavedOrdersScreen from './screens/SavedOrdersScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import ItemsScreen from './screens/ItemsScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNavigation from './components/layout/BottomNavigation';
// Use OpenAI Realtime API instead of Gemini/WebSocket
import { useVoiceClientOpenAI } from './hooks/useVoiceClientOpenAI';
import Header from './components/layout/Header';
import { useMediaQuery } from './hooks/useMediaQuery';

function App() {
    // Last updated: 2025-11-21 15:31
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleToolExecuted = useCallback((name: string, result: any) => {
        if (name === 'navigate_to_screen' && result.success) {
            const screenMap: Record<string, number> = {
                'menu': 0,
                'tabs': 1,
                'transactions': 2,
                'items': 3,
                'inventory': 3,
                'settings': 4
            };
            const index = screenMap[result.screen];
            if (index !== undefined) {
                setCurrentIndex(index);
            }
        }
    }, []);

    const isCompactLayout = useMediaQuery('(max-width: 1024px)');

    // Backend API URL for OpenAI Realtime API
    // Backend handles ephemeral tokens and tool execution
    const normalizeApiUrl = (url: string): string => {
        // If URL already has a protocol, return as-is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // Otherwise, add https:// for production URLs or http:// for localhost
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            return `http://${url}`;
        }
        return `https://${url}`;
    };

    const rawApiUrl = import.meta.env.VITE_API_URL
        || (import.meta.env.PROD
            ? `${window.location.protocol}//${window.location.host}`
            : 'http://localhost:3000');           // Development: local backend

    const apiUrl = normalizeApiUrl(rawApiUrl);

    const voiceClient = useVoiceClientOpenAI(apiUrl, handleToolExecuted);
    const { isListening, isSpeaking } = voiceClient;

    const screens = [
        <ProductsScreen key="products" />,
        <SavedOrdersScreen key="saved-orders" />,
        <TransactionsScreen key="transactions" />,
        <ItemsScreen key="items" />,
        <SettingsScreen key="settings" />,
    ];

    return (
        <div
            className="app-container"
            style={{
                width: '100%',
                minHeight: '100vh',
                height: isCompactLayout ? 'auto' : '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.brand.backgroundColor,
                position: 'relative', // Ensure overlay is positioned relative to this
                paddingBottom: isCompactLayout ? 'calc(110px + env(safe-area-inset-bottom, 0))' : 0,
            }}
        >
            {/* Premium Voice Pulse Overlay */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 9999,
                    transition: 'opacity 0.5s ease',
                    opacity: !isCompactLayout && (isSpeaking || isListening) ? 1 : 0,
                    // Use a large inset shadow for the diffuse glow
                    boxShadow: isSpeaking
                        ? `inset 0 0 40px 10px rgba(255, 182, 193, 0.6)` // Diffuse Pink
                        : isListening
                            ? `inset 0 0 40px 10px rgba(255, 182, 193, 0.3)` // Softer Pink
                            : 'none',
                    animation: !isCompactLayout && (isSpeaking || isListening) ? 'dreamyBreath 4s ease-in-out infinite' : 'none',
                }}
            />
            <style>{`
                @keyframes dreamyBreath {
                    0% { 
                        box-shadow: inset 0 0 30px 5px ${isSpeaking ? 'rgba(255, 182, 193, 0.4)' : 'rgba(255, 182, 193, 0.2)'}; 
                    }
                    50% { 
                        box-shadow: inset 0 0 60px 20px ${isSpeaking ? 'rgba(255, 182, 193, 0.7)' : 'rgba(255, 182, 193, 0.4)'}; 
                    }
                    100% { 
                        box-shadow: inset 0 0 30px 5px ${isSpeaking ? 'rgba(255, 182, 193, 0.4)' : 'rgba(255, 182, 193, 0.2)'}; 
                    }
                }
            `}</style>

            {/* Header */}
            <Header />

            {/* Main content */}
            <div
                style={{
                    flex: 1,
                    overflow: isCompactLayout ? 'visible' : 'hidden',
                }}
            >
                {screens[currentIndex]}
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation
                currentIndex={currentIndex}
                onNavigate={setCurrentIndex}
                voiceClient={voiceClient}
                isCompact={isCompactLayout}
            />
        </div>
    );
}

export default App;
