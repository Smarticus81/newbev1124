import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';
import { logger } from '../../../utils/logger.js';
import { Id } from '../../../../convex/_generated/dataModel.js';

interface CartItemInput {
    drink_name: string;
    quantity: number;
}

export class AddMultipleToCartTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'add_multiple_to_cart',
        description: 'Add multiple drinks to cart in one operation. Use this for orders with 2+ items.',
        parameters: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    description: 'Array of drinks to add',
                    items: {
                        type: 'object',
                        properties: {
                            drink_name: {
                                type: 'string',
                                description: 'Name of the drink'
                            },
                            quantity: {
                                type: 'integer',
                                description: 'Quantity to add',
                                default: 1
                            }
                        },
                        required: ['drink_name', 'quantity']
                    }
                }
            },
            required: ['items']
        }
    };

    async execute(params: any, context: ToolContext) {
        let { items } = params;

        if (!items || items.length === 0) {
            throw new Error('No items provided');
        }

        // **FIX**: Gemini sometimes sends strings instead of objects. Normalize the input.
        items = items.map((item: any) => {
            // If item is a string, convert to object
            if (typeof item === 'string') {
                return { drink_name: item, quantity: 1 };
            }
            // If it's already an object, use it as-is
            return item;
        });

        const results = [];
        const errors = [];

        // Process each item
        for (const normalizedItem of items) {
            try {
                const { drink_name, quantity = 1 } = normalizedItem;

                if (!drink_name) {
                    errors.push(`Invalid item: missing drink_name`);
                    continue;
                }

                // Search for the drink
                const drinks = await convex.query(api.drinks.searchDrinks, { query: drink_name });

                if (!drinks || drinks.length === 0) {
                    errors.push(`"${drink_name}" not found`);
                    continue;
                }

                const product = drinks[0];

                // Check inventory
                if (product.inventory < quantity) {
                    errors.push(`Only ${product.inventory} ${product.name} available`);
                    continue;
                }

                // Add to cart
                const orderId = await convex.mutation(api.orders.addToOrder, {
                    sessionId: context.sessionId,
                    drinkId: product._id as Id<"drinks">,
                    quantity
                });

                results.push({
                    name: product.name,
                    quantity,
                    price: product.price,
                    orderId
                });

                logger.info({ product: product.name, quantity, sessionId: context.sessionId }, 'Added to cart (batch)');

            } catch (error) {
                logger.error({ error, item: normalizedItem }, 'Error adding item in batch');
                errors.push(`Failed to add "${normalizedItem.drink_name || 'unknown'}": ${error}`);
            }
        }

        const successCount = results.length;
        const errorCount = errors.length;

        return {
            success: successCount > 0,
            message: `Added ${successCount} item(s) to cart${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
            added: results,
            errors: errorCount > 0 ? errors : undefined,
            total_items: successCount
        };
    }
}
