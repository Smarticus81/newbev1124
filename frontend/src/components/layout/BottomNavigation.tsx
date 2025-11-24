import { theme } from '../../styles/theme';
import VoiceButton from '../voice/VoiceButton';

interface BottomNavigationProps {
    currentIndex: number;
    onNavigate: (index: number) => void;
    voiceClient: any;
    isCompact?: boolean;
}

const BottomNavigation = ({ currentIndex, onNavigate, voiceClient, isCompact = false }: BottomNavigationProps) => {
    const screenNames = ['Menu', 'Tabs', 'Transactions', 'Items', 'Settings'];

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
        // Settings icon
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11.94 2.5l.36 1.78c.3.05.59.13.88.23l1.54-1.1 1.54 2.66-1.54 1.1c.12.28.21.57.28.87l1.8.36v3.08l-1.8.36c-.07.3-.16.6-.28.88l1.54 1.1-1.54 2.66-1.54-1.1c-.29.1-.58.18-.88.23l-.36 1.78H8.06l-.36-1.78a5.45 5.45 0 01-.88-.23l-1.54 1.1-1.54-2.66 1.54-1.1a5.7 5.7 0 01-.28-.88l-1.8-.36V8.47l1.8-.36c.07-.3.16-.59.28-.87l-1.54-1.1 1.54-2.66 1.54 1.1c.29-.1.58-.18.88-.23l.36-1.78h3.88zM10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
        </svg>,
    ];

    const selectedColor = theme.brand.pine;
    const unselectedColor = theme.neutral[500];

    return (
        <div
            style={{
                position: 'relative',
                height: isCompact ? '76px' : '100px',
                paddingBottom: isCompact ? 'env(safe-area-inset-bottom, 0px)' : 0,
            }}
        >
            {/* Bottom bar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: isCompact ? '76px' : '100px',
                    backgroundColor: theme.neutral[0],
                    borderTop: `1px solid ${theme.neutral[300]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: isCompact ? '12px' : '24px',
                    paddingTop: isCompact ? '12px' : '8px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isCompact ? '12px' : '18px',
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
                                    gap: isCompact ? '6px' : '10px',
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
                                        fontSize: isCompact ? '14px' : '18px',
                                        fontWeight: isSelected ? 600 : 400,
                                        fontFamily: 'Instrument Sans, sans-serif',
                                        display: isCompact ? 'none' : 'inline',
                                    }}
                                >
                                    {name}
                                </span>
                                {isCompact && (
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: isSelected ? 600 : 500,
                                            letterSpacing: 0.2,
                                            textTransform: 'uppercase',
                                            display: 'block',
                                            marginTop: '2px',
                                        }}
                                    >
                                        {name.slice(0, 3)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Voice button - positioned like Flutter (right: 154px, top: 15px) */}
            <div
                style={{
                    position: 'absolute',
                    right: isCompact ? '50%' : '154px',
                    top: isCompact ? '-28px' : '15px',
                    zIndex: 10,
                    transform: isCompact ? 'translateX(50%)' : 'none',
                }}
            >
                <VoiceButton voiceClient={voiceClient} />
            </div>
        </div>
    );
};

export default BottomNavigation;
