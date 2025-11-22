import { Hono } from 'hono';
import { convex } from '../lib/convex.js';
import { api } from '../../convex/_generated/api.js';
import { Id } from '../../convex/_generated/dataModel.js';

export const productRoutes = new Hono();

// Get all products
productRoutes.get('/', async (c) => {
    const category = c.req.query('category');

    const drinks = await convex.query(api.drinks.searchDrinks, {
        query: "",
        category: category || undefined
    });

    // Map Convex docs to frontend Product model
    const products = drinks.map(d => ({
        id: d._id,
        name: d.name,
        category: d.category,
        price: d.price,
        imageUrl: d.image_url,
        stock: d.inventory,
        createdAt: new Date(d.created_at).toISOString(),
        updatedAt: new Date(d.updated_at).toISOString(),
    }));

    return c.json(products); // Frontend expects array directly based on fetchProducts in ProductsScreen.tsx
});

// Get single product
productRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        // We use checkInventory to get the drink details
        const result = await convex.query(api.drinks.checkInventory, { drinkId: id as Id<"drinks"> });

        if (!result || !result.drink) {
            return c.json({ error: 'Product not found' }, 404);
        }

        const d = result.drink;
        const product = {
            id: d._id,
            name: d.name,
            category: d.category,
            price: d.price,
            imageUrl: d.image_url,
            stock: d.inventory,
            createdAt: new Date(d.created_at).toISOString(),
            updatedAt: new Date(d.updated_at).toISOString(),
        };

        return c.json({ product });
    } catch (error) {
        return c.json({ error: 'Invalid ID or product not found' }, 404);
    }
});

// Get product categories
productRoutes.get('/categories/list', async (c) => {
    const drinks = await convex.query(api.drinks.searchDrinks, { query: "" });
    const categories = Array.from(new Set(drinks.map(d => d.category))).sort();

    return c.json({ categories });
});
