import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';
import { logger } from '../../../utils/logger.js';
import { Id } from '../../../../convex/_generated/dataModel.js';

export class AddToCartTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'add_to_cart',
        description: 'Add a drink to the customer\'s cart',
        parameters: {
            type: 'object',
            properties: {
                drink_name: {
                    type: 'string',
                    description: 'Name of the drink to add'
                },
                quantity: {
                    type: 'integer',
                    description: 'Quantity to add (default: 1)',
                    default: 1
                }
            },
            required: ['drink_name']
        }
    };

    async execute(params: { drink_name: string; quantity?: number }, context: ToolContext) {
        const { drink_name, quantity = 1 } = params;

        // Find product (fuzzy match)
        const drinks = await convex.query(api.drinks.searchDrinks, { query: drink_name });

        if (!drinks || drinks.length === 0) {
            throw new Error(`Drink "${drink_name}" not found in our system`);
        }

        const product = drinks[0];

        // Check inventory
        if (product.inventory < quantity) {
            throw new Error(`Only ${product.inventory} ${product.name} available in stock`);
        }

        // Add to order (finds existing pending order for session or creates new)
        const orderId = await convex.mutation(api.orders.addToOrder, {
            sessionId: context.sessionId,
            drinkId: product._id as Id<"drinks">,
            quantity
        });

        logger.info({ product: product.name, quantity, sessionId: context.sessionId, orderId }, 'Added to cart/order');

        return {
            success: true,
            message: `Added ${quantity}x ${product.name} to your cart`,
            product: {
                id: product._id,
                name: product.name,
                price: product.price,
                quantity
            },
            orderId
        };
    }
}
