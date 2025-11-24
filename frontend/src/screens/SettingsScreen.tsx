import { useState, useRef } from 'react';
import { theme } from '../styles/theme';
import BevProLogo from '../components/common/BevProLogo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import type { Id } from '../../../backend/convex/_generated/dataModel';

const SettingsScreen = () => {
    const [selectedVoice, setSelectedVoice] = useState(() => 
        localStorage.getItem('gemini_voice') || 'Puck'
    );
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [editingDrink, setEditingDrink] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allDrinks = useQuery(api.drinks.listDrinks) || [];
    const updateDrink = useMutation(api.drinks.updateDrink);

    const voices = [
        { id: 'Puck', name: 'Puck', description: 'Warm and friendly' },
        { id: 'Charon', name: 'Charon', description: 'Deep and authoritative' },
        { id: 'Kore', name: 'Kore', description: 'Clear and professional' },
        { id: 'Fenrir', name: 'Fenrir', description: 'Bold and confident' },
        { id: 'Aoede', name: 'Aoede', description: 'Melodic and soothing' },
    ];

    // Group drinks by category
    const categories = Array.from(new Set(allDrinks.map((d: any) => d.category))).filter(Boolean);
    const categoryGroups: Record<string, any[]> = {};
    categories.forEach(cat => {
        categoryGroups[cat] = allDrinks.filter((d: any) => d.category === cat);
    });

    const handleVoiceChange = (voiceId: string) => {
        setSelectedVoice(voiceId);
        localStorage.setItem('gemini_voice', voiceId);
        
        // Show confirmation with reconnection notice
        const message = `Voice changed to ${voiceId}.\n\nThe new voice will be active when you start a new conversation or reconnect.`;
        alert(message);
    };

    const handleToggleDrink = async (drinkId: Id<"drinks">, currentActive: boolean) => {
        try {
            await updateDrink({
                drinkId,
                updates: {
                    is_active: !currentActive
                }
            });
        } catch (error) {
            console.error('Error toggling drink:', error);
        }
    };

    const handleImageUpload = async (drinkId: Id<"drinks">, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // In a real app, you'd upload to a CDN/storage service
        // For now, we'll just use a placeholder URL
        const imageUrl = `/drink_images/${file.name}`;

        try {
            await updateDrink({
                drinkId,
                updates: {
                    image_url: imageUrl
                }
            });
        } catch (error) {
            console.error('Error updating image:', error);
        }
    };

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                backgroundColor: theme.brand.backgroundColor,
                overflowY: 'auto',
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1
                    style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: theme.neutrals[900],
                        marginBottom: '8px',
                    }}
                >
                    Settings
                </h1>
                <p
                    style={{
                        fontSize: '14px',
                        color: theme.neutrals[600],
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
                        color: theme.neutrals[900],
                        marginBottom: '16px',
                    }}
                >
                    AI Voice Selection
                </h2>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                    }}
                >
                    {voices.map((voice) => (
                        <button
                            key={voice.id}
                            onClick={() => handleVoiceChange(voice.id)}
                            style={{
                                padding: '16px',
                                borderRadius: '8px',
                                border: selectedVoice === voice.id ? `2px solid ${theme.brand.primary}` : '2px solid #E5E7EB',
                                backgroundColor: selectedVoice === voice.id ? '#FEF3F2' : 'white',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: '600',
                                    color: theme.neutrals[900],
                                    marginBottom: '4px',
                                }}
                            >
                                {voice.name}
                            </div>
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: theme.neutrals[600],
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
                        color: theme.neutrals[900],
                        marginBottom: '16px',
                    }}
                >
                    Manage Drinks
                </h2>

                {!selectedCategory ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '12px',
                        }}
                    >
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '2px solid #E5E7EB',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    color: theme.neutrals[900],
                                    transition: 'all 0.2s',
                                }}
                            >
                                {category}
                                <div style={{ fontSize: '12px', color: theme.neutrals[600], marginTop: '4px' }}>
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
                            }}
                        >
                            ← Back to Categories
                        </button>

                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: theme.neutrals[900],
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
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
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
                                            <div style={{ fontWeight: '600', color: theme.neutrals[900] }}>
                                                {drink.name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: theme.neutrals[600] }}>
                                                ${(drink.price / 100).toFixed(2)} · {drink.inventory} in stock
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = (e: any) => handleImageUpload(drink._id, e);
                                                input.click();
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #E5E7EB',
                                                backgroundColor: 'white',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                            }}
                                        >
                                            Upload Image
                                        </button>
                                        <button
                                            onClick={() => handleToggleDrink(drink._id, drink.is_active)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                backgroundColor: drink.is_active ? theme.red[600] : theme.green[600],
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                            }}
                                        >
                                            {drink.is_active ? 'Disable' : 'Enable'}
                                        </button>
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
                        color: theme.neutrals[900],
                        marginBottom: '12px',
                    }}
                >
                    System Information
                </h2>
                <div style={{ fontSize: '14px', color: theme.neutrals[600], lineHeight: '1.6' }}>
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

