export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    imageUrl?: string | null;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    orderName?: string | null;
    status: 'open' | 'saved' | 'closed';
    total: number;
    customCharges: number;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
    closedAt?: string | null;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    product: Product;
    quantity: number;
    price: number;
    createdAt: string;
}

export interface EventPackage {
    id: string;
    name: string;
    description?: string | null;
    pricePerGuest: number;
    minGuests: number;
    maxGuests: number;
    features: string[];
    createdAt: string;
    updatedAt: string;
}

export type ProductCategory = 'beer' | 'wine' | 'cocktail' | 'spirit';

export interface CategoryInfo {
    name: ProductCategory;
    displayName: string;
    color: string;
    icon?: string;
}
