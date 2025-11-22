import { create } from 'zustand';
import type { Product, CartItem } from '../types/models';

interface CartStore {
    items: CartItem[];
    customCharges: number;
    sessionId: string | null;
    currentOrderId: string | null;

    // Actions
    setSessionId: (id: string | null) => void;
    setOrderId: (id: string | null) => void;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    setCustomCharges: (amount: number) => void;

    // Computed
    getTotal: () => number;
    getItemCount: () => number;
    getSubtotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    customCharges: 0,
    sessionId: null,
    currentOrderId: null,

    setSessionId: (id) => set({ sessionId: id }),
    setOrderId: (id) => set({ currentOrderId: id }),

    addItem: (product, quantity = 1) => {
        set((state) => {
            const existingItem = state.items.find(
                (item) => item.product.id === product.id
            );

            if (existingItem) {
                // Update quantity of existing item
                return {
                    items: state.items.map((item) =>
                        item.product.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ),
                };
            } else {
                // Add new item
                const newItem: CartItem = {
                    id: `cart-${Date.now()}-${Math.random()}`,
                    product,
                    quantity,
                    price: product.price,
                };
                return {
                    items: [...state.items, newItem],
                };
            }
        });
    },

    removeItem: (itemId) => {
        set((state) => ({
            items: state.items.filter((item) => item.id !== itemId),
        }));
    },

    updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(itemId);
            return;
        }

        set((state) => ({
            items: state.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            ),
        }));
    },

    clearCart: () => {
        set({ items: [], customCharges: 0 });
    },

    setCustomCharges: (amount) => {
        set({ customCharges: amount });
    },

    getSubtotal: () => {
        const state = get();
        return state.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    },

    getTotal: () => {
        const state = get();
        return state.getSubtotal() + state.customCharges;
    },

    getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
}));
