import { theme } from '../../styles/theme';
import { useCartStore } from '../../store/cartStore';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { CartItem as CartItemType } from '../../types/models';
import type { Id } from '../../../convex/_generated/dataModel';

interface CartItemProps {
    item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
    const { sessionId } = useCartStore();
    const updateQuantity = useMutation(api.cartMutations.updateItemQuantity);
    const removeItem = useMutation(api.cartMutations.removeItemFromCart);

    const handleIncrement = async () => {
        if (!sessionId) return;
        try {
            await updateQuantity({
                sessionId,
                drinkId: item.id as Id<"drinks">,
                quantity: item.quantity + 1
            });
        } catch (error) {
            console.error('Failed to increment:', error);
        }
    };

    const handleDecrement = async () => {
        if (!sessionId) return;
        try {
            if (item.quantity > 1) {
                await updateQuantity({
                    sessionId,
                    drinkId: item.id as Id<"drinks">,
                    quantity: item.quantity - 1
                });
            } else {
                await removeItem({
                    sessionId,
                    drinkId: item.id as Id<"drinks">
                });
            }
        } catch (error) {
            console.error('Failed to decrement:', error);
        }
    };

    const itemTotal = item.price * item.quantity;

    return (
        <div
            style={{
                padding: '12px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderBottom: '1px solid transparent', // Placeholder for hover effect if needed
            }}
        >
            {/* Top Row: Name and Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                    style={{
                        ...theme.typography.callText,
                        color: theme.neutral[1000],
                        fontSize: '15px',
                        fontWeight: 500,
                    }}
                >
                    {item.product.name}
                </div>
                <div
                    style={{
                        ...theme.typography.callText,
                        color: theme.brand.pine, // Or neutral[600] based on image
                        fontWeight: 500,
                    }}
                >
                    ${itemTotal.toFixed(2)}
                </div>
            </div>

            {/* Bottom Row: Quantity Controls - Sleek Rectangular Design */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Minus Button */}
                <button
                    onClick={handleDecrement}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px', // Sleek rectangular
                        backgroundColor: theme.neutral[100],
                        border: `1px solid ${theme.neutral[200]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: theme.neutral[700],
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.neutral[200];
                        e.currentTarget.style.borderColor = theme.neutral[300];
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.neutral[100];
                        e.currentTarget.style.borderColor = theme.neutral[200];
                    }}
                >
                    <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor">
                        <rect width="10" height="2" rx="1" />
                    </svg>
                </button>

                {/* Quantity */}
                <span
                    style={{
                        ...theme.typography.callText,
                        color: theme.neutral[1000],
                        fontWeight: 600,
                        minWidth: '20px',
                        textAlign: 'center',
                        fontSize: '14px',
                    }}
                >
                    {item.quantity}
                </span>

                {/* Plus Button */}
                <button
                    onClick={handleIncrement}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px', // Sleek rectangular
                        backgroundColor: theme.neutral[100],
                        border: `1px solid ${theme.neutral[200]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: theme.neutral[700],
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.neutral[200];
                        e.currentTarget.style.borderColor = theme.neutral[300];
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.neutral[100];
                        e.currentTarget.style.borderColor = theme.neutral[200];
                    }}
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                        <rect x="0" y="4" width="10" height="2" rx="1" />
                        <rect x="4" y="0" width="2" height="10" rx="1" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CartItem;
