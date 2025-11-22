import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class CreateAdjustmentTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'create_adjustment',
        description: 'Log inventory adjustments (spillage, breakage, comps, theft, expired)',
        parameters: {
            type: 'object',
            properties: {
                product_name: { type: 'string', description: 'Product name (e.g., "Bud Light", "Tito\'s Vodka")' },
                location_name: { type: 'string', description: 'Location name' },
                quantity: { type: 'number', description: 'Quantity (positive for add, negative for remove)' },
                adjustment_type: { type: 'string', description: 'Type: spillage, breakage, comp, theft, expired' },
                note: { type: 'string', description: 'Optional note' }
            },
            required: ['product_name', 'location_name', 'quantity', 'adjustment_type']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            // Search for product by name
            const products = await convex.query(api.drinks.searchDrinks, {
                query: params.product_name
            });

            if (!products || products.length === 0) {
                return {
                    success: false,
                    message: `Product "${params.product_name}" not found`
                };
            }

            // Use first match
            const product = products[0];

            const adjustmentId = await convex.mutation(api.inventoryAdjustments.createAdjustment, {
                drink_id: product._id,
                location_name: params.location_name,
                quantity: params.quantity,
                adjustment_type: params.adjustment_type,
                note: params.note
            });

            return {
                success: true,
                message: `Adjustment recorded for ${product.name}: ${params.adjustment_type} (${params.quantity})`,
                adjustmentId
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class ReadAdjustmentHistoryTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'read_adjustment_history',
        description: 'Retrieve historical adjustment logs',
        parameters: {
            type: 'object',
            properties: {
                product_id: { type: 'string', description: 'Product ID (optional)' }
            }
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            const adjustments = await convex.query(api.inventoryAdjustments.readAdjustmentHistory, {
                drink_id: params.product_id
            });

            return {
                success: true,
                adjustments,
                count: adjustments.length
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class VoidAdjustmentTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'void_adjustment',
        description: 'Void an incorrect or fraudulent inventory adjustment',
        parameters: {
            type: 'object',
            properties: {
                adjustment_id: { type: 'string', description: 'Adjustment ID' },
                reason: { type: 'string', description: 'Reason for voiding' }
            },
            required: ['adjustment_id']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            await convex.mutation(api.inventoryAdjustments.voidAdjustment, {
                adjustment_id: params.adjustment_id,
                reason: params.reason
            });

            return { success: true, message: 'Adjustment voided successfully' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}
