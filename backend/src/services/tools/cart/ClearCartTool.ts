import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class ClearCartTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'clear_cart',
        description: 'Clear all items from the cart',
        parameters: {
            type: 'object',
            properties: {}
        }
    };

    async execute(params: {}, context: ToolContext) {
        const result = await convex.mutation(api.orders.clearCart, {
            sessionId: context.sessionId
        });

        return {
            success: true,
            message: `Cleared ${result.count} items from cart`,
            itemsRemoved: result.count
        };
    }
}
