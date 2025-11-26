import { useState } from 'react';
import { theme } from '../styles/theme';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import BevProLogo from '../components/common/BevProLogo';
import { useMediaQuery } from '../hooks/useMediaQuery';

const ItemsScreen = () => {
    const drinks = useQuery(api.drinks.listDrinks) || [];
    const isCompact = useMediaQuery('(max-width: 1024px)');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const categories = ['All', ...Array.from(new Set(drinks.map((d: any) => d.category)))] as string[];

    const filteredDrinks = drinks.filter((drink: any) => {
        const matchesSearch = drink.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || drink.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (inventory: number) => {
        if (inventory === 0) return { label: 'Out of Stock', color: theme.red[600], bg: theme.red[100] };
        if (inventory < 5) return { label: 'Low Stock', color: '#D97706', bg: '#FEF3C7' };
        return { label: 'In Stock', color: theme.green[700], bg: theme.green[100] };
    };

    return (
        <div style={{
            width: '100%',
            minHeight: '100%',
            backgroundColor: theme.brand.backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            padding: isCompact ? '16px' : '24px',
            gap: isCompact ? '16px' : '24px',
            overflow: isCompact ? 'visible' : 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: isCompact ? 'column' : 'row',
                alignItems: isCompact ? 'flex-start' : 'center',
                justifyContent: isCompact ? 'flex-start' : 'space-between',
                gap: isCompact ? '12px' : '0',
                marginBottom: isCompact ? '8px' : '24px',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BevProLogo width={isCompact ? 88 : 110} color={theme.blue[400]} />
                    <h1 style={{
                        ...theme.typography.headingH2,
                        color: theme.neutral[900],
                        margin: 0,
                        fontSize: isCompact ? '24px' : theme.typography.headingH2.fontSize
                    }}>Inventory</h1>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    width: isCompact ? '100%' : 'auto',
                    justifyContent: isCompact ? 'stretch' : 'flex-end'
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: isCompact ? '1' : '0' }}>
                        <input
                            type="text"
                            placeholder="Search drinks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: isCompact ? '100%' : '250px',
                                height: '40px',
                                padding: '0 16px 0 40px',
                                borderRadius: '8px',
                                border: `1px solid ${theme.neutral[300]}`,
                                outline: 'none',
                                fontFamily: 'Instrument Sans, sans-serif',
                                fontSize: '14px'
                            }}
                        />
                        <svg
                            width="16" height="16" viewBox="0 0 16 16" fill="none"
                            style={{ position: 'absolute', left: '12px', top: '12px', color: theme.neutral[500] }}
                        >
                            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{
                            flex: isCompact ? '1' : '0',
                            height: '40px',
                            padding: '0 16px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.neutral[300]}`,
                            backgroundColor: theme.neutral[0],
                            fontFamily: 'Instrument Sans, sans-serif',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Inventory Table */}
            <div style={{
                flex: 1,
                backgroundColor: theme.neutral[0],
                borderRadius: '12px',
                boxShadow: theme.shadows.small,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Table Header */}
                {!isCompact && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 2fr 1.5fr 1fr 1fr 1fr',
                        padding: '16px 24px',
                        borderBottom: `1px solid ${theme.neutral[200]}`,
                        backgroundColor: theme.neutral[100],
                        fontWeight: 600,
                        color: theme.neutral[600],
                        fontSize: '14px'
                    }}>
                        <div></div>
                        <div>Name</div>
                        <div>Category</div>
                        <div>Price</div>
                        <div>Stock (Bottles)</div>
                        <div>Status</div>
                    </div>
                )}

                {/* Table Body */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {filteredDrinks.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: theme.neutral[500] }}>
                            No drinks found.
                        </div>
                    ) : (
                        filteredDrinks.map((drink: any) => {
                            const status = getStockStatus(drink.inventory);

                            if (isCompact) {
                                return (
                                    <div
                                        key={drink._id}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            padding: '14px 16px',
                                            borderRadius: '12px',
                                            border: `1px solid ${theme.neutral[200]}`,
                                            backgroundColor: theme.neutral[0],
                                            marginBottom: '12px',
                                            boxShadow: theme.shadows.small
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div>
                                                {drink.image_url ? (
                                                    <img
                                                        src={drink.image_url}
                                                        alt={drink.name}
                                                        style={{
                                                            width: '46px',
                                                            height: '46px',
                                                            borderRadius: '8px',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '46px',
                                                        height: '46px',
                                                        borderRadius: '8px',
                                                        backgroundColor: theme.neutral[200],
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px'
                                                    }}>
                                                        🍺
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: theme.neutral[900], fontSize: '16px' }}>
                                                    {drink.name}
                                                </div>
                                                <div style={{ color: theme.neutral[500], fontSize: '13px' }}>
                                                    {drink.category || 'Uncategorized'}
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '999px',
                                                backgroundColor: status.bg,
                                                color: status.color,
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '13px',
                                            color: theme.neutral[600]
                                        }}>
                                            <span>Price <strong>${(drink.price / 100).toFixed(2)}</strong></span>
                                            <span>{drink.inventory.toFixed(1)} bottles</span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={drink._id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '60px 2fr 1.5fr 1fr 1fr 1fr',
                                    padding: '16px 24px',
                                    borderBottom: `1px solid ${theme.neutral[100]}`,
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    color: theme.neutral[800],
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer'
                                }}>
                                    <div>
                                        {drink.image_url ? (
                                            <img
                                                src={drink.image_url}
                                                alt={drink.name}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '6px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '6px',
                                                backgroundColor: theme.neutral[200],
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px'
                                            }}>
                                                🍺
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ fontWeight: 600 }}>{drink.name}</div>

                                    <div style={{ color: theme.neutral[600] }}>{drink.category}</div>

                                    <div style={{ fontWeight: 500 }}>${(drink.price / 100).toFixed(2)}</div>

                                    <div style={{
                                        fontWeight: 600,
                                        color: drink.inventory < 5 ? theme.red[600] : theme.neutral[800]
                                    }}>
                                        {drink.inventory.toFixed(1)}
                                    </div>

                                    <div>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            backgroundColor: status.bg,
                                            color: status.color,
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemsScreen;
