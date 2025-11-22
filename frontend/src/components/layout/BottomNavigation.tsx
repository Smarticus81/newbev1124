import { theme } from '../../styles/theme';
import VoiceButton from '../voice/VoiceButton';

interface BottomNavigationProps {
    currentIndex: number;
    onNavigate: (index: number) => void;
    voiceClient: any;
}

const BottomNavigation = ({ currentIndex, onNavigate, voiceClient }: BottomNavigationProps) => {
    const screenNames = ['Menu', 'Tabs', 'Transactions', 'Items'];

    // Icon SVGs (simplified versions - you can replace with actual icons)
    const icons = [
        // Menu icon
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="4" width="16" height="2" rx="1" />
            <rect x="2" y="9" width="16" height="2" rx="1" />
            <rect x="2" y="14" width="16" height="2" rx="1" />
        </svg>,
        // Tabs icon
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="3" width="6" height="14" rx="1" />
            <rect x="12" y="3" width="6" height="14" rx="1" />
        </svg>,
        // Transactions icon
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z" />
        </svg>,
        // Items icon
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="3" y="3" width="6" height="6" rx="1" />
            <rect x="11" y="3" width="6" height="6" rx="1" />
            <rect x="3" y="11" width="6" height="6" rx="1" />
            <rect x="11" y="11" width="6" height="6" rx="1" />
        </svg>,
    ];

    const selectedColor = theme.brand.pine;
    const unselectedColor = theme.neutral[500];

    return (
        <div
            style={{
                position: 'relative',
                height: '100px',
            }}
        >
            {/* Bottom bar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '100px',
                    backgroundColor: theme.neutral[0],
                    borderTop: `1px solid ${theme.neutral[300]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: '24px',
                    paddingTop: '8px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px',
                    }}
                >
                    {screenNames.map((name, index) => {
                        const isSelected = currentIndex === index;
                        const color = isSelected ? selectedColor : unselectedColor;

                        return (
                            <button
                                key={name}
                                onClick={() => onNavigate(index)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color,
                                    transition: 'color 0.2s ease',
                                }}
                                className="no-select"
                            >
                                <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {icons[index]}
                                </div>
                                <span
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: isSelected ? 600 : 400,
                                        fontFamily: 'Instrument Sans, sans-serif',
                                    }}
                                >
                                    {name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Voice button - positioned like Flutter (right: 154px, top: 15px) */}
            <div
                style={{
                    position: 'absolute',
                    right: '154px',
                    top: '15px',
                    zIndex: 10,
                }}
            >
                <VoiceButton voiceClient={voiceClient} />
            </div>
        </div>
    );
};

export default BottomNavigation;
