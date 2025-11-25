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
                position: isCompact ? 'fixed' : 'relative',
                bottom: isCompact ? '20px' : 'auto',
                left: isCompact ? '20px' : 'auto',
                right: isCompact ? '20px' : 'auto',
                height: isCompact ? 'auto' : '100px',
                zIndex: 1000,
                pointerEvents: 'none', // Allow clicks to pass through the container area not covered by the bar
            }}
        >
            {/* Bottom bar - Liquid Glass Design for Mobile */}
            <div
                style={{
                    position: isCompact ? 'relative' : 'absolute',
                    bottom: isCompact ? 'auto' : 0,
                    left: isCompact ? 'auto' : 0,
                    right: isCompact ? 'auto' : 0,
                    height: isCompact ? '70px' : '100px',
                    backgroundColor: isCompact ? 'rgba(255, 255, 255, 0.75)' : theme.neutral[0],
                    backdropFilter: isCompact ? 'blur(20px)' : 'none',
                    WebkitBackdropFilter: isCompact ? 'blur(20px)' : 'none',
                    borderTop: isCompact ? '1px solid rgba(255, 255, 255, 0.4)' : `1px solid ${theme.neutral[300]}`,
                    borderRadius: isCompact ? '24px' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: isCompact ? '0' : '24px',
                    paddingTop: isCompact ? '0' : '8px',
                    boxShadow: isCompact ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none',
                    pointerEvents: 'auto',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: isCompact ? '100%' : 'auto',
                        padding: isCompact ? '0 24px' : '0',
                        gap: isCompact ? '0' : '18px',
                    }}
                >
                    {screenNames.map((name, index) => {
                        const isSelected = currentIndex === index;
                        const color = isSelected ? selectedColor : unselectedColor;

                        // Skip the middle item for mobile (Voice button placeholder) if needed, 
                        // but here we just distribute them. 
                        // Actually, let's arrange them around the center voice button if desired, 
                        // or keep them as is. The voice button is absolute positioned.

                        return (
                            <button
                                key={name}
                                onClick={() => onNavigate(index)}
                                style={{
                                    display: 'flex',
                                    flexDirection: isCompact ? 'column' : 'row',
                                    alignItems: 'center',
                                    gap: isCompact ? '4px' : '10px',
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color,
                                    transition: 'all 0.2s ease',
                                    transform: isSelected && isCompact ? 'translateY(-2px)' : 'none',
                                }}
                                className="no-select"
                            >
                                <div style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    filter: isSelected && isCompact ? `drop-shadow(0 0 8px ${theme.brand.pine}40)` : 'none'
                                }}>
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
                                            fontSize: '10px',
                                            fontWeight: isSelected ? 700 : 500,
                                            letterSpacing: 0.2,
                                            textTransform: 'uppercase',
                                            display: 'block',
                                            opacity: isSelected ? 1 : 0.7,
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

            {/* Voice button - Floating above liquid glass */}
            <div
                style={{
                    position: 'absolute',
                    right: isCompact ? '50%' : '154px',
                    top: isCompact ? '-25px' : '15px',
                    zIndex: 10,
                    transform: isCompact ? 'translateX(50%)' : 'none',
                    pointerEvents: 'auto',
                    filter: isCompact ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none',
                }}
            >
                <VoiceButton voiceClient={voiceClient} />
            </div>
        </div>
    );
};

export default BottomNavigation;
