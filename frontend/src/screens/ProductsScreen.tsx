import { useEffect, useMemo, useState } from 'react';
import { theme } from '../styles/theme';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Product } from '../types/models';
import ProductCard from '../components/products/ProductCard';
import CartPanel from '../components/cart/CartPanel';
import BevProLogo from '../components/common/BevProLogo';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useCartStore } from '../store/cartStore';

const ProductsScreen = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('Signature');
    const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
    const [searchQuery, setSearchQuery] = useState('');

    const isCompact = useMediaQuery('(max-width: 1024px)');
    // const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0)); // Removed local store dependency
    const { sessionId, currentOrderId } = useCartStore();
    const [showCartSheet, setShowCartSheet] = useState(false);

    // Fetch cart for badge count
    const cartOrder = useQuery(api.orders.getCart, 
        currentOrderId ? { orderId: currentOrderId as any } : 
        sessionId ? { sessionId } : "skip"
    );
    const cartCount = cartOrder?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

    // Fetch all drinks from Convex
    const allDrinks = useQuery(api.drinks.listDrinks) || [];

    // Transform Convex drinks to Product format
    const products: Product[] = useMemo(() => allDrinks.map((drink: any) => ({
        id: drink._id,
        name: drink.name,
        category: drink.category,
        price: drink.price / 100, // Convert cents to dollars
        inventory: drink.inventory,
        stock: drink.inventory, // Alias for compatibility
        imageUrl: drink.image_url,
        createdAt: new Date(drink.created_at).toISOString(),
        updatedAt: new Date(drink.updated_at).toISOString(),
    })), [allDrinks]);

    useEffect(() => {
        setShowCartSheet(!isCompact);
    }, [isCompact]);

    // Filter products based on Category and Search
    const filteredProducts = useMemo(() => products.filter((product) => {
        const prodCat = product.category || '';
        let matchCategory = false;

        // Normalize for comparison
        const currentTab = selectedCategory.toLowerCase();
        const productCategory = prodCat.toLowerCase();

        if (currentTab === 'spirits') {
            matchCategory = productCategory.includes('spirit') || productCategory.includes('liquor') || productCategory.includes('vodka') || productCategory.includes('gin') || productCategory.includes('rum') || productCategory.includes('tequila') || productCategory.includes('whiskey');
        } else if (currentTab === 'beer') {
            matchCategory = productCategory.includes('beer') || productCategory.includes('lager') || productCategory.includes('ale') || productCategory.includes('ipa');
        } else if (currentTab === 'wines') {
            matchCategory = productCategory.includes('wine') || productCategory.includes('red') || productCategory.includes('white') || productCategory.includes('rose');
        } else if (currentTab === 'non-alcoholic') {
            matchCategory = productCategory.includes('non-alcoholic') || productCategory.includes('mocktail') || productCategory.includes('soft drink') || productCategory.includes('water') || productCategory.includes('juice');
        } else {
            // Direct match for Signature, Classics (case-insensitive)
            matchCategory = productCategory === currentTab;
        }

        const matchesSearch = product.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return matchCategory && matchesSearch;
    }), [products, selectedCategory, searchQuery]);

    const categories = ['Signature', 'Classics', 'Beer', 'Wines', 'Spirits', 'Non-Alcoholic'];

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        setViewMode('products');
    };

    // Show loading state while data is fetching
    if (!allDrinks) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.brand.backgroundColor,
            }}>
                <div style={{ textAlign: 'center', color: theme.neutral[500] }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            minHeight: '100%',
            display: 'flex',
            flexDirection: isCompact ? 'column' : 'row',
            backgroundColor: theme.brand.backgroundColor,
        }}>
            {/* Left side - Products Grid */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: isCompact ? 'visible' : 'hidden',
            }}>
                {/* Header Bar with Logo, Tabs, Search */}
                <div style={{
                    padding: isCompact ? '16px 16px 12px 16px' : '16px 24px',
                    display: 'flex',
                    alignItems: isCompact ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: isCompact ? '12px' : '24px',
                    flexDirection: isCompact ? 'column' : 'row',
                    backgroundColor: theme.neutral[0],
                    borderBottom: `1px solid ${theme.neutral[200]}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? '12px' : '32px', flexWrap: 'wrap' }}>
                        {/* BevPro Logo */}
                        <BevProLogo width={isCompact ? 90 : 110} color={theme.blue[400]} />

                        {/* Back Button (only in products mode) */}
                        {viewMode === 'products' && (
                            <button
                                onClick={() => setViewMode('categories')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: theme.neutral[600],
                                    fontWeight: 500,
                                    fontSize: '14px'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                                    <path d="M10 12L6 8L10 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Categories
                            </button>
                        )}

                        {/* Category Tabs (only in products mode) */}
                        {viewMode === 'products' && (
                            <div 
                                style={{ 
                                    display: 'flex', 
                                    gap: '8px', 
                                    flexWrap: isCompact ? 'nowrap' : 'wrap', 
                                    maxWidth: isCompact ? '100%' : 'unset',
                                    overflowX: isCompact ? 'auto' : 'visible',
                                    paddingBottom: isCompact ? '4px' : '0',
                                    width: isCompact ? '100%' : 'auto',
                                    scrollbarWidth: 'none', // Hide scrollbar for Firefox
                                    msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
                                }}
                                className="hide-scrollbar" // Assuming you have a global class or I'll add inline style for hiding scrollbar
                            >
                                {isCompact && <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>}
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: `1px solid ${selectedCategory === category ? theme.neutral[900] : theme.neutral[300]}`,
                                            backgroundColor: selectedCategory === category ? theme.neutral[0] : (isCompact ? 'rgba(255,255,255,0.5)' : theme.neutral[0]),
                                            color: selectedCategory === category ? theme.neutral[900] : theme.neutral[500],
                                            fontWeight: selectedCategory === category ? 600 : 400,
                                            cursor: 'pointer',
                                            fontFamily: 'Instrument Sans, sans-serif',
                                            fontSize: isCompact ? '13px' : '14px',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap', // Prevent wrapping text
                                            flexShrink: 0, // Prevent shrinking
                                        }}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search Field */}
                    <div style={{ width: isCompact ? '100%' : '320px', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                height: '40px',
                                padding: '0 16px 0 40px',
                                backgroundColor: theme.neutral[0],
                                border: `1px solid ${theme.neutral[300]}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'Instrument Sans, sans-serif',
                                outline: 'none',
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
                </div>

                {/* Content Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                }}>
                    {viewMode === 'categories' ? (
                        /* Categories Grid */
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isCompact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, 1fr)',
                            gap: isCompact ? '14px' : '24px',
                            height: '100%',
                        }}>
                            {categories.map(category => {
                                // Map category to color
                                let bgGradient = `linear-gradient(135deg, ${theme.neutral[0]} 0%, ${theme.neutral[100]} 100%)`;
                                let accentColor: string = theme.brand.pine;

                                switch (category) {
                                    case 'Signature':
                                        bgGradient = `linear-gradient(135deg, ${theme.category.lightTeal} 0%, ${theme.neutral[0]} 100%)`;
                                        accentColor = theme.green[700];
                                        break;
                                    case 'Classics':
                                        bgGradient = `linear-gradient(135deg, ${theme.category.lightBlue} 0%, ${theme.neutral[0]} 100%)`;
                                        accentColor = theme.blue[700];
                                        break;
                                    case 'Beer':
                                        bgGradient = `linear-gradient(135deg, ${theme.category.lightYellow} 0%, ${theme.neutral[0]} 100%)`;
                                        accentColor = theme.brand.lager;
                                        break;
                                    case 'Wines':
                                        bgGradient = `linear-gradient(135deg, ${theme.category.lightPurple} 0%, ${theme.neutral[0]} 100%)`;
                                        accentColor = theme.blue[900];
                                        break;
                                    case 'Spirits':
                                        bgGradient = `linear-gradient(135deg, ${theme.category.lightOrange} 0%, ${theme.neutral[0]} 100%)`;
                                        accentColor = theme.orange[700];
                                        break;
                                    case 'Non-Alcoholic':
                                        bgGradient = `linear-gradient(135deg, ${theme.category.lightGreen} 0%, ${theme.neutral[0]} 100%)`;
                                        accentColor = theme.green[600];
                                        break;
                                }

                                return (
                                    <div
                                        key={category}
                                        onClick={() => handleCategoryClick(category)}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            minHeight: isCompact ? '140px' : '180px',
                                            background: bgGradient,
                                            borderRadius: '16px',
                                            boxShadow: theme.shadows.medium,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            border: `1px solid ${theme.neutral[200]}`,
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = theme.shadows.large;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = theme.shadows.medium;
                                        }}
                                    >
                                        {/* Decorative background circle */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-20%',
                                            right: '-20%',
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            backgroundColor: accentColor,
                                            opacity: 0.1,
                                            pointerEvents: 'none'
                                        }} />

                                        <h3 style={{
                                            fontSize: isCompact ? '20px' : '24px',
                                            fontWeight: 600,
                                            color: theme.neutral[900],
                                            margin: 0,
                                            zIndex: 1
                                        }}>
                                            {category}
                                        </h3>
                                        <span style={{
                                            marginTop: '8px',
                                            fontSize: isCompact ? '13px' : '14px',
                                            color: theme.neutral[600],
                                            zIndex: 1,
                                            fontWeight: 500
                                        }}>
                                            View Items &rarr;
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Product Grid */
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isCompact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: isCompact ? '12px' : '16px',
                        }}>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', backgroundColor: theme.neutral[200] }} />

            {/* Right side - Cart Panel */}
            {!isCompact && <CartPanel />}

            {isCompact && (
                <>
                    {showCartSheet && (
                        <div
                            onClick={() => setShowCartSheet(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                backgroundColor: 'rgba(15, 23, 42, 0.32)',
                                zIndex: 1005,
                            }}
                        />
                    )}

                    <CartPanel
                        isCompact
                        isOpen={showCartSheet}
                        onClose={() => setShowCartSheet(false)}
                    />

                    <button
                        onClick={() => setShowCartSheet((prev) => !prev)}
                        style={{
                            position: 'fixed',
                            bottom: `calc(120px + env(safe-area-inset-bottom, 0px))`, // Moved up to clear the liquid footer
                            right: '20px', // Moved to right side for better ergonomics
                            left: 'auto',
                            transform: 'none',
                            padding: '14px 24px',
                            backgroundColor: theme.brand.pine,
                            color: 'white',
                            borderRadius: '999px',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '15px',
                            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)',
                            zIndex: 1200,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backdropFilter: 'blur(10px)', // Add glass feel to button too
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7-4h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {showCartSheet ? 'Close' : `Cart${cartCount ? ` · ${cartCount}` : ''}`}
                    </button>
                </>
            )}
        </div>
    );
};

export default ProductsScreen;
