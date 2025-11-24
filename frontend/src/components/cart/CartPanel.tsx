import { useState } from 'react';
import { theme } from '../../styles/theme';
import { useCartStore } from '../../store/cartStore';
import CartItem from './CartItem';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../backend/convex/_generated/api';
import BevProLogo from '../common/BevProLogo';

interface CartPanelProps {
    isCompact?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

const CartPanel = ({ isCompact = false, isOpen = true, onClose }: CartPanelProps) => {
    const { sessionId, currentOrderId } = useCartStore();
    const [orderName, setOrderName] = useState("New Tab");
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch cart from Convex using orderId (if Tab opened) or voice session ID
    const cartOrder = useQuery(api.orders.getCart,
        currentOrderId ? { orderId: currentOrderId as any } :
            sessionId ? { sessionId } : "skip"
    );

    // Mutations
    const processPayment = useMutation(api.orders.processPayment);

    // Derived state from Convex data
    const items = cartOrder?.items?.map((item: any) => ({
        id: item.drinkId, // Use drinkId as unique key for UI list
        product: {
            id: item.drinkId,
            name: item.name,
            price: item.price / 100, // Convert cents to dollars
            category: 'drink', // Placeholder
            inventory: 999, // Placeholder
        },
        quantity: item.quantity,
        price: item.price / 100 // Convert cents to dollars
    })) || [];

    const subtotal = (cartOrder?.subtotal || 0) / 100;
    const tax = (cartOrder?.tax_amount || 0) / 100;
    const total = (cartOrder?.total || 0) / 100;

    const handlePay = async () => {
        if (!cartOrder || items.length === 0) return;

        setIsProcessing(true);

        try {
            await processPayment({
                orderId: cartOrder._id,
                paymentMethod: 'card', // Default for now
                customerName: orderName
            });

            alert('Order placed successfully!');
            // Cart clears automatically via Convex reactivity (status changes to completed)
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error placing order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = () => {
        alert('Save tab functionality coming soon!');
    };

    const containerBase: React.CSSProperties = isCompact
        ? {
            position: 'fixed',
            left: '50%',
            transform: `translate(-50%, ${isOpen ? '0%' : '110%'})`,
            bottom: `calc(env(safe-area-inset-bottom, 0px))`,
            width: '100%',
            maxWidth: '520px',
            backgroundColor: theme.neutral[0],
            display: 'flex',
            flexDirection: 'column',
            height: '75vh',
            borderRadius: '22px 22px 12px 12px',
            boxShadow: '0 -12px 35px rgba(15, 23, 42, 0.28)',
            border: `1px solid ${theme.neutral[200]}`,
            transition: 'transform 0.35s ease',
            zIndex: 1100,
            overflow: 'hidden',
            paddingBottom: `calc(12px + env(safe-area-inset-bottom, 0px))`,
            pointerEvents: isOpen ? 'auto' : 'none',
        }
        : {
            width: '375px',
            backgroundColor: theme.neutral[0],
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderLeft: `1px solid ${theme.neutral[200]}`,
        };

    const headerStyle: React.CSSProperties = isCompact
        ? {
            padding: '18px 20px 12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.neutral[200]}`
        }
        : { padding: '16px', display: 'flex', gap: '12px' };

    const bodyPadding = isCompact ? '0 20px' : '0 16px';

    return (
        <div
            style={containerBase}
        >
            {/* Header with Save and Pay buttons */}
            <div style={headerStyle}>
                {isCompact && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '4px',
                            borderRadius: '99px',
                            backgroundColor: theme.neutral[200],
                        }} />
                        <span style={{ ...theme.typography.subheadText, color: theme.neutral[500], fontSize: '14px' }}>
                            Active Cart
                        </span>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    style={{
                        flex: 1,
                        padding: isCompact ? '10px' : '12px',
                        backgroundColor: theme.neutral[100], // Light grey
                        color: theme.neutral[1000],
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: isCompact ? '14px' : '15px',
                        fontWeight: 600,
                        fontFamily: 'Instrument Sans, sans-serif',
                        cursor: 'pointer',
                    }}
                >
                    Save
                </button>

                {/* Pay Button */}
                <button
                    onClick={handlePay}
                    disabled={items.length === 0 || isProcessing}
                    style={{
                        flex: 1,
                        padding: isCompact ? '10px' : '12px',
                        backgroundColor: '#FFC531', // Exact yellow from image
                        color: theme.neutral[1000],
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: isCompact ? '14px' : '15px',
                        fontWeight: 600,
                        fontFamily: 'Instrument Sans, sans-serif',
                        cursor: items.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                        opacity: items.length === 0 ? 0.7 : 1,
                    }}
                >
                    {isProcessing ? 'Processing...' : 'Pay'}
                </button>

                {/* Print Button */}
                <button
                    style={{
                        width: isCompact ? '40px' : '44px',
                        height: isCompact ? '40px' : '44px',
                        backgroundColor: theme.neutral[0],
                        border: `1px solid ${theme.neutral[300]}`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill={theme.neutral[600]}>
                        <path d="M16 8V4H4v4H2v8h4v4h8v-4h4V8h-2zM6 6h8v2H6V6zm8 12H6v-4h8v4zm2-4v-2H4v2H4v-4h12v4h-2z" />
                    </svg>
                </button>
            </div>

            {/* Tab Name and Info */}
            <div style={{ padding: `${isCompact ? '0 20px 12px 20px' : '0 16px 16px 16px'}` }}>
                <input
                    type="text"
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    style={{
                        ...theme.typography.headingH5,
                        color: theme.neutral[1000],
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        padding: 0,
                        width: '100%',
                        fontSize: isCompact ? '16px' : '18px',
                        fontWeight: 700,
                    }}
                />
                <div style={{ ...theme.typography.caption1, color: theme.neutral[500], marginTop: '4px' }}>
                    Session: {currentOrderId ? 'Tab Open' : (sessionId ? sessionId.slice(0, 8) : 'Connecting...')}
                </div>
            </div>

            {/* Cart Items List */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: bodyPadding,
                }}
            >
                {items.length === 0 ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: theme.neutral[400],
                        }}
                    >
                        <p style={{ ...theme.typography.subheadText }}>Cart is empty</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {items.map((item: any) => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            {/* Summary Section */}
            <div style={{ padding: isCompact ? '16px 20px 0 20px' : '16px', borderTop: `1px solid ${theme.neutral[200]}` }}>
                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ ...theme.typography.subheadText, color: theme.neutral[600] }}>
                        Subtotal
                    </span>
                    <span style={{ ...theme.typography.subheadText, color: theme.neutral[1000] }}>
                        ${subtotal.toFixed(2)}
                    </span>
                </div>

                {/* Tax */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ ...theme.typography.subheadText, color: theme.neutral[600] }}>
                        Tax (8.25%)
                    </span>
                    <span style={{ ...theme.typography.subheadText, color: theme.neutral[1000] }}>
                        ${tax.toFixed(2)}
                    </span>
                </div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <span style={{ ...theme.typography.headingH5, color: theme.neutral[1000], fontWeight: 600 }}>
                        Total
                    </span>
                    <span style={{ ...theme.typography.headingH5, color: theme.neutral[1000], fontWeight: 600 }}>
                        ${total.toFixed(2)}
                    </span>
                </div>

                {/* BEVPRO Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
                    <BevProLogo width={isCompact ? 64 : 80} color="#A5BEC5" />
                </div>
            </div>

            {isCompact && onClose && (
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '14px',
                        right: '18px',
                        background: 'none',
                        border: 'none',
                        color: theme.neutral[400],
                        fontSize: '16px',
                        cursor: 'pointer',
                    }}
                    aria-label="Close cart"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default CartPanel;
