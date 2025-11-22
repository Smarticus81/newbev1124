import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';
import { Id } from '../../../../convex/_generated/dataModel.js';

export class CheckInventoryTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'check_inventory',
        description: 'Check inventory levels for specific drinks or all drinks',
        parameters: {
            type: 'object',
            properties: {
                drink_name: {
                    type: 'string',
                    description: 'Optional: specific drink to check. If not provided, shows low stock items'
                }
            }
        }
    };

    async execute(params: { drink_name?: string }, context: ToolContext) {
        if (params.drink_name) {
            // Check specific drink
            // First find the drink
            const drinks = await convex.query(api.drinks.searchDrinks, { query: params.drink_name });

            if (!drinks || drinks.length === 0) {
                throw new Error(`Drink "${params.drink_name}" not found`);
            }

            const product = drinks[0];

            // Get detailed inventory
            const details = await convex.query(api.drinks.checkInventory, { drinkId: product._id as Id<"drinks"> });

            if (!details) {
                throw new Error(`Drink "${params.drink_name}" details not found`);
            }

            const status = details.total_inventory === 0 ? 'OUT OF STOCK' :
                details.total_inventory < 5 ? 'LOW STOCK' : 'IN STOCK';

            return {
                success: true,
                message: `${product.name}: ${details.total_inventory} in stock (${status})`,
                product: {
                    name: product.name,
                    quantity: details.total_inventory,
                    status
                }
            };
        } else {
            // Show low stock items
            const lowStockItems = await convex.query(api.drinks.listLowStock, {});

            if (!lowStockItems || lowStockItems.length === 0) {
                return {
                    success: true,
                    message: 'All items are well-stocked!',
                    items: []
                };
            }

            return {
                success: true,
                message: `${lowStockItems.length} items are low on stock`,
                items: lowStockItems.map(p => ({
                    name: p.name,
                    quantity: p.inventory,
                    status: p.inventory === 0 ? 'OUT OF STOCK' : 'LOW STOCK'
                }))
            };
        }
    }
}
