import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class RemoveFromCartTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'remove_from_cart',
        description: 'Remove a drink from the cart',
        parameters: {
            type: 'object',
            properties: {
                drink_name: {
                    type: 'string',
                    description: 'Name of the drink to remove'
                },
                quantity: {
                    type: 'integer',
                    description: 'Quantity to remove (default: 1)',
                    default: 1
                }
            },
            required: ['drink_name']
        }
    };

    async execute(params: { drink_name: string; quantity?: number }, context: ToolContext) {
        const { drink_name, quantity = 1 } = params;

        try {
            const result = await convex.mutation(api.orders.removeFromCart, {
                sessionId: context.sessionId,
                drinkName: drink_name,
                quantity
            });

            if (result.removed) {
                return {
                    success: true,
                    message: `Removed ${result.itemName} from cart`,
                    removed: true
                };
            } else {
                return {
                    success: true,
                    message: `Removed ${quantity}x ${result.itemName}, ${result.remaining} remaining in cart`,
                    removed: false,
                    remaining: result.remaining
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}
