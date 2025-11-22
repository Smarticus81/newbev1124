import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class ShowCartTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'show_cart',
        description: 'Display current cart contents with total',
        parameters: {
            type: 'object',
            properties: {}
        }
    };

    async execute(params: {}, context: ToolContext) {
        const order = await convex.query(api.orders.getCart, { sessionId: context.sessionId });

        if (!order || !order.items || order.items.length === 0) {
            return {
                success: true,
                message: 'Your cart is empty',
                items: [],
                total: 0,
                itemCount: 0
            };
        }

        const items = order.items.map((item: any) => ({
            id: item.drinkId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
        }));

        const total = order.total / 100; // Convert cents to dollars
        const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

        return {
            success: true,
            message: `Cart has ${itemCount} items totaling $${total.toFixed(2)}`,
            items,
            total,
            itemCount
        };
    }
}
