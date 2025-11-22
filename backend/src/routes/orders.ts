import { Hono } from 'hono';
import { convex } from '../lib/convex.js';
import { api } from '../../convex/_generated/api.js';
import { Id } from '../../convex/_generated/dataModel.js';

export const orderRoutes = new Hono();

// Get all orders
orderRoutes.get('/', async (c) => {
    const limit = parseInt(c.req.query('limit') || '50');

    const orders = await convex.query(api.orders.listOrders, { limit });

    // Map Convex docs to frontend Order model
    const mappedOrders = orders.map(o => ({
        id: o._id,
        orderName: o.order_name,
        status: o.status === 'completed' ? 'closed' : 'open', // Map status
        total: o.total,
        customCharges: 0,
        items: o.items.map((i: any) => ({
            id: i.drinkId, // Using drinkId as item ID for now
            orderId: o._id,
            productId: i.drinkId,
            product: { name: i.name, price: i.price }, // Minimal product info
            quantity: i.quantity,
            price: i.price,
            createdAt: new Date(o.created_at).toISOString(),
        })),
        createdAt: new Date(o.created_at).toISOString(),
        updatedAt: new Date(o.updated_at).toISOString(),
        closedAt: o.payment_status === 'completed' ? new Date(o.updated_at).toISOString() : null,
    }));

    return c.json({ orders: mappedOrders });
});

// Get single order
orderRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const order = await convex.query(api.orders.getOrder, { orderId: id as Id<"orders"> });

        if (!order) {
            return c.json({ error: 'Order not found' }, 404);
        }

        const mappedOrder = {
            id: order._id,
            orderName: order.order_name,
            status: order.status === 'completed' ? 'closed' : 'open',
            total: order.total,
            customCharges: 0,
            items: order.items.map((i: any) => ({
                id: i.drinkId,
                orderId: order._id,
                productId: i.drinkId,
                product: { name: i.name, price: i.price },
                quantity: i.quantity,
                price: i.price,
                createdAt: new Date(order.created_at).toISOString(),
            })),
            createdAt: new Date(order.created_at).toISOString(),
            updatedAt: new Date(order.updated_at).toISOString(),
            closedAt: order.payment_status === 'completed' ? new Date(order.updated_at).toISOString() : null,
        };

        return c.json({ order: mappedOrder });
    } catch (error) {
        return c.json({ error: 'Invalid ID or order not found' }, 404);
    }
});

// Create and process order (POST)
orderRoutes.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { items, orderName, paymentMethod = 'card' } = body;

        if (!items || items.length === 0) {
            return c.json({ error: 'No items provided' }, 400);
        }

        // Map frontend items to Convex format
        const convexItems = items.map((item: any) => ({
            drinkId: item.id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
        }));

        // Create the order
        const orderId = await convex.mutation(api.orders.createOrder, {
            items: convexItems,
        });

        // Process payment immediately
        await convex.mutation(api.orders.processPayment, {
            orderId: orderId as Id<"orders">,
            paymentMethod,
            customerName: orderName,
        });

        return c.json({
            success: true,
            orderId,
            message: 'Order placed successfully'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return c.json({ error: 'Failed to create order' }, 500);
    }
});
