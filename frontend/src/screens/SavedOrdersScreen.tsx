import { useState } from 'react';
import { theme } from '../styles/theme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import BevProLogo from '../components/common/BevProLogo';
import { useCartStore } from '../store/cartStore';
import type { Id } from '../../convex/_generated/dataModel';
import { useMediaQuery } from '../hooks/useMediaQuery';

const SavedOrdersScreen = () => {
    const tabs = useQuery(api.orders.listPendingOrders) || [];
    const createOrder = useMutation(api.orders.createOrder);
    const voidOrder = useMutation(api.orders.voidOrder);
    const setOrderId = useCartStore((state) => state.setOrderId);
    const setSessionId = useCartStore((state) => state.setSessionId);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTabName, setNewTabName] = useState('');
    const isCompact = useMediaQuery('(max-width: 1024px)');

    const handleCreateTab = async () => {
        if (!newTabName.trim()) return;
        await createOrder({
            items: [],
            customerName: newTabName,
            status: 'pending',
            payment_status: 'pending',
            subtotal: 0,
            tax_amount: 0,
            total: 0,
        } as any);
        setNewTabName('');
        setIsModalOpen(false);
    };

    const handleOpenTab = (tab: any) => {
        setOrderId(tab._id);
        if (tab.session_id) {
            setSessionId(tab.session_id);
        }
        // Ideally navigate to Products screen here
        // For now, we rely on user navigation or voice command
    };

    const handleVoidTab = async (e: React.MouseEvent, tabId: Id<"orders">) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to void this tab?')) {
            await voidOrder({ orderId: tabId });
        }
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
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BevProLogo width={isCompact ? 90 : 110} color={theme.blue[400]} />
                    <h1 style={{
                        ...theme.typography.headingH2,
                        color: theme.neutral[900],
                        margin: 0,
                        fontSize: isCompact ? '24px' : theme.typography.headingH2.fontSize
                    }}>
                        Open Tabs
                    </h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        backgroundColor: theme.brand.pine,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: isCompact ? '10px 18px' : '12px 24px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: theme.shadows.medium,
                        width: isCompact ? '100%' : 'auto'
                    }}
                >
                    + New Tab
                </button>
            </div>

            {/* Tabs Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: isCompact ? '12px' : '16px',
                overflowY: isCompact ? 'visible' : 'auto',
                paddingBottom: '20px'
            }}>
                {tabs.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: theme.neutral[500], marginTop: '40px' }}>
                        No open tabs. Create one to get started.
                    </div>
                ) : (
                    tabs.map((tab: any) => (
                        <div
                            key={tab._id}
                            onClick={() => handleOpenTab(tab)}
                            style={{
                                backgroundColor: theme.neutral[0],
                                borderRadius: '12px',
                                padding: isCompact ? '16px' : '20px',
                                boxShadow: theme.shadows.small,
                                border: `1px solid ${theme.neutral[200]}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: isCompact ? '10px' : '12px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: isCompact ? '16px' : '18px', color: theme.neutral[900] }}>
                                    {tab.order_name || `Tab #${tab._id.slice(-4)}`}
                                </span>
                                <span style={{
                                    fontSize: isCompact ? '11px' : '12px',
                                    color: theme.neutral[500],
                                    backgroundColor: theme.neutral[100],
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                }}>
                                    {new Date(tab.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div style={{ flex: 1, minHeight: isCompact ? '50px' : '60px' }}>
                                {tab.items && tab.items.length > 0 ? (
                                    <>
                                        {tab.items.slice(0, 3).map((item: any, idx: number) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: theme.neutral[600], marginBottom: '4px' }}>
                                                <span>{item.quantity}x {item.name}</span>
                                            </div>
                                        ))}
                                        {tab.items.length > 3 && (
                                            <div style={{ fontSize: '12px', color: theme.neutral[400] }}>+ {tab.items.length - 3} more items</div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ fontSize: '14px', color: theme.neutral[400], fontStyle: 'italic' }}>Empty Tab</div>
                                )}
                            </div>

                            <div style={{ borderTop: `1px solid ${theme.neutral[200]}`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                    onClick={(e) => handleVoidTab(e, tab._id)}
                                    style={{
                                        backgroundColor: '#FEE2E2', // Light red
                                        color: '#DC2626', // Dark red
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Void
                                </button>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: theme.neutral[500], fontSize: '12px' }}>Total</div>
                                    <div style={{ fontWeight: 700, fontSize: '20px', color: theme.brand.pine }}>
                                        ${(tab.total / 100).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Tab Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '400px',
                        boxShadow: theme.shadows.large
                    }}>
                        <h2 style={{ ...theme.typography.headingH3, marginTop: 0 }}>New Tab</h2>
                        <input
                            type="text"
                            placeholder="Customer Name (e.g. John)"
                            value={newTabName}
                            onChange={(e) => setNewTabName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: `1px solid ${theme.neutral[300]}`,
                                fontSize: '16px',
                                marginBottom: '24px'
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: theme.neutral[200],
                                    color: theme.neutral[700],
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTab}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: theme.brand.pine,
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Create Tab
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedOrdersScreen;
