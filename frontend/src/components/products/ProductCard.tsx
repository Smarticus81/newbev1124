import { theme } from '../../styles/theme';
import { useCartStore } from '../../store/cartStore';
import { useMutation } from 'convex/react';
import { api } from '../../../../backend/convex/_generated/api';
import type { Product } from '../../types/models';
import type { Id } from '../../../../backend/convex/_generated/dataModel';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { sessionId } = useCartStore();
    const addToOrder = useMutation(api.orders.addToOrder);

    const handleClick = async () => {
        if (!sessionId) {
            console.error("No session ID found");
            return;
        }
        try {
            await addToOrder({
                sessionId,
                drinkId: product.id as Id<"drinks">,
                quantity: 1
            });
        } catch (error) {
            console.error("Failed to add to order:", error);
        }
    };

    return (
        <button
            onClick={handleClick}
            style={{
                backgroundColor: theme.neutral[0],
                border: `1px solid ${theme.neutral[200]}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                transition: 'all 0.2s ease',
                height: '140px',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme.shadows.medium;
                e.currentTarget.style.borderColor = theme.brand.pine;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = theme.neutral[200];
            }}
            className="no-select"
        >
            {/* Left Side: Text Info */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', flex: 1 }}>
                <div>
                    {/* Product Name (Blue) */}
                    <div
                        style={{
                            ...theme.typography.headingH4,
                            color: '#A5BEC5', // Specific light blue from image (Abc)
                            marginBottom: '4px',
                            lineHeight: '1.1',
                        }}
                    >
                        {product.name.substring(0, 3)}
                    </div>

                    {/* Description/Full Name */}
                    <div
                        style={{
                            ...theme.typography.callText, // Used callText instead of bodyText
                            color: theme.neutral[1000],
                            fontSize: '15px',
                            fontWeight: 500,
                            marginBottom: '2px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {product.name}
                    </div>
                </div>

                {/* Price */}
                <div
                    style={{
                        ...theme.typography.caption1,
                        color: theme.neutral[600],
                        fontSize: '14px',
                    }}
                >
                    ${product.price.toFixed(2)}
                </div>
            </div>

            {/* Right Side: Image/Icon */}
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: theme.neutral[100],
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px',
                        }}
                    />
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 4l7 8v8l2-2V12l7-8H5z" stroke="white" strokeWidth="2" fill="none" />
                    </svg>
                )}
            </div>

            {/* Stock indicator */}
            {product.stock < 10 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        ...theme.typography.caption2,
                        color: theme.red[500],
                        backgroundColor: theme.red[100],
                        padding: '2px 6px',
                        borderRadius: '4px',
                    }}
                >
                    Low: {product.stock}
                </div>
            )}
        </button>
    );
};

export default ProductCard;
