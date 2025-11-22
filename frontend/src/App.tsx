import { useState, useCallback } from 'react';
import './style.css';
import { theme } from './styles/theme';
import ProductsScreen from './screens/ProductsScreen';
import SavedOrdersScreen from './screens/SavedOrdersScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import ItemsScreen from './screens/ItemsScreen';
import BottomNavigation from './components/layout/BottomNavigation';
import { useVoiceClient } from './hooks/useVoiceClient';
import Header from './components/layout/Header';

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
                'inventory': 3
            };
            const index = screenMap[result.screen];
            if (index !== undefined) {
                setCurrentIndex(index);
            }
        }
    }, []);

    const voiceClient = useVoiceClient('ws://localhost:3001', handleToolExecuted);
    const { isListening, isSpeaking } = voiceClient;

    const screens = [
        <ProductsScreen key="products" />,
        <SavedOrdersScreen key="saved-orders" />,
        <TransactionsScreen key="transactions" />,
        <ItemsScreen key="items" />,
    ];

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.brand.backgroundColor,
                position: 'relative', // Ensure overlay is positioned relative to this
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
                    opacity: (isSpeaking || isListening) ? 1 : 0,
                    // Use a large inset shadow for the diffuse glow
                    boxShadow: isSpeaking
                        ? `inset 0 0 40px 10px rgba(255, 182, 193, 0.6)` // Diffuse Pink
                        : isListening
                            ? `inset 0 0 40px 10px rgba(255, 182, 193, 0.3)` // Softer Pink
                            : 'none',
                    animation: (isSpeaking || isListening) ? 'dreamyBreath 4s ease-in-out infinite' : 'none',
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
                    overflow: 'hidden',
                }}
            >
                {screens[currentIndex]}
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation
                currentIndex={currentIndex}
                onNavigate={setCurrentIndex}
                voiceClient={voiceClient}
            />
        </div>
    );
}

export default App;
