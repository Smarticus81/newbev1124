import { useState } from 'react';
import { theme } from '../styles/theme';
import BevProLogo from '../components/common/BevProLogo';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useMediaQuery } from '../hooks/useMediaQuery';

const SettingsScreen = () => {
    const [selectedVoice, setSelectedVoice] = useState(() => 
        localStorage.getItem('gemini_voice') || 'Puck'
    );
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const allDrinks = useQuery(api.drinks.listDrinks) || [];
    const isCompact = useMediaQuery('(max-width: 1024px)');

    const voices = [
        { id: 'Puck', name: 'Puck', description: 'Warm and friendly' },
        { id: 'Charon', name: 'Charon', description: 'Deep and authoritative' },
        { id: 'Kore', name: 'Kore', description: 'Clear and professional' },
        { id: 'Fenrir', name: 'Fenrir', description: 'Bold and confident' },
        { id: 'Aoede', name: 'Aoede', description: 'Melodic and soothing' },
    ];

    // Group drinks by category
    const categories = Array.from(new Set(allDrinks.map((d: any) => d.category))).filter(Boolean) as string[];
    const categoryGroups: Record<string, any[]> = {};
    categories.forEach((cat: string) => {
        categoryGroups[cat] = allDrinks.filter((d: any) => d.category === cat);
    });

    const handleVoiceChange = (voiceId: string) => {
        setSelectedVoice(voiceId);
        localStorage.setItem('gemini_voice', voiceId);
        
        // Show confirmation with reconnection notice
        const message = `Voice changed to ${voiceId}.\n\nThe new voice will be active when you start a new conversation or reconnect.`;
        alert(message);
    };

    // Drink management functions would go here
    // For now, just display - mutations can be added later

    return (
        <div
            style={{
                width: '100%',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: isCompact ? '16px' : '24px',
                gap: isCompact ? '16px' : '24px',
                backgroundColor: theme.brand.backgroundColor,
                overflowY: 'auto',
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: isCompact ? '12px' : '24px' }}>
                <h1
                    style={{
                        fontSize: isCompact ? '24px' : '28px',
                        fontWeight: '700',
                        color: theme.neutral[900],
                        marginBottom: '8px',
                    }}
                >
                    Settings
                </h1>
                <p
                    style={{
                        fontSize: isCompact ? '13px' : '14px',
                        color: theme.neutral[600],
                    }}
                >
                    Configure voice and manage drinks
                </p>
            </div>

            {/* Voice Selection */}
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
            >
                <h2
                    style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: theme.neutral[900],
                        marginBottom: '16px',
                    }}
                >
                    AI Voice Selection
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: isCompact ? '10px' : '12px',
                    }}
                >
                    {voices.map((voice) => (
                        <button
                            key={voice.id}
                            onClick={() => handleVoiceChange(voice.id)}
                            style={{
                                padding: isCompact ? '14px' : '16px',
                                borderRadius: '8px',
                                border: selectedVoice === voice.id ? `2px solid ${theme.brand.lager}` : '2px solid #E5E7EB',
                                backgroundColor: selectedVoice === voice.id ? '#FEF3F2' : 'white',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: '600',
                                    color: theme.neutral[900],
                                    marginBottom: '4px',
                                }}
                            >
                                {voice.name}
                            </div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: theme.neutral[600],
                                }}
                            >
                                {voice.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Drink Management */}
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
            >
                <h2
                    style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: theme.neutral[900],
                        marginBottom: '16px',
                    }}
                >
                    Manage Drinks
                </h2>

                {!selectedCategory ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isCompact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: isCompact ? '10px' : '12px',
                        }}
                    >
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                padding: isCompact ? '16px' : '20px',
                                    borderRadius: '8px',
                                    border: '2px solid #E5E7EB',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    color: theme.neutral[900],
                                    transition: 'all 0.2s',
                                }}
                            >
                                {category}
                                <div style={{ fontSize: '12px', color: theme.neutral[600], marginTop: '4px' }}>
                                    {categoryGroups[category].length} drinks
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            style={{
                                marginBottom: '16px',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                width: isCompact ? '100%' : 'auto'
                            }}
                        >
                            ← Back to Categories
                        </button>

                        <h3
                            style={{
                                fontSize: isCompact ? '15px' : '16px',
                                fontWeight: '600',
                                color: theme.neutral[900],
                                marginBottom: '12px',
                            }}
                        >
                            {selectedCategory} Drinks
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {categoryGroups[selectedCategory]?.map((drink: any) => (
                                <div
                                    key={drink._id}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #E5E7EB',
                                        backgroundColor: drink.is_active ? 'white' : '#F9FAFB',
                                        display: 'flex',
                                        alignItems: isCompact ? 'flex-start' : 'center',
                                        justifyContent: 'space-between',
                                        flexDirection: isCompact ? 'column' : 'row',
                                        gap: isCompact ? '12px' : '8px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        {drink.image_url && (
                                            <img
                                                src={drink.image_url}
                                                alt={drink.name}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '6px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '600', color: theme.neutral[900] }}>
                                                {drink.name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: theme.neutral[600] }}>
                                                ${(drink.price / 100).toFixed(2)} · {drink.inventory} in stock
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '12px', color: drink.is_active ? theme.green[600] : theme.red[600], alignSelf: isCompact ? 'flex-start' : 'center' }}>
                                        {drink.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* System Info */}
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
            >
                <h2
                    style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: theme.neutral[900],
                        marginBottom: '12px',
                    }}
                >
                    System Information
                </h2>
                <div style={{ fontSize: '14px', color: theme.neutral[600], lineHeight: '1.6' }}>
                    <div>Voice Engine: Gemini 2.5 Flash</div>
                    <div>Database: Convex</div>
                    <div>Version: 1.0.0</div>
                </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <BevProLogo />
            </div>
        </div>
    );
};

export default SettingsScreen;

