import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class StartInventoryCountTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'start_inventory_count',
        description: 'Begin a physical inventory count session',
        parameters: {
            type: 'object',
            properties: {
                location_name: { type: 'string', description: 'Location name (e.g., Main Bar, Storage)' },
                count_name: { type: 'string', description: 'Optional name for this count' }
            },
            required: ['location_name']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            const sessionId = await convex.mutation(api.inventoryCounts.startInventoryCount, {
                location_name: params.location_name,
                count_name: params.count_name
            });

            return {
                success: true,
                message: `Inventory count started for ${params.location_name}`,
                sessionId
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class UpdateInventoryCountTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'update_inventory_count',
        description: 'Record quantity counted for a product during an inventory session',
        parameters: {
            type: 'object',
            properties: {
                count_session_id: { type: 'string', description: 'Count session ID' },
                product_id: { type: 'string', description: 'Product ID' },
                quantity: { type: 'number', description: 'Quantity counted' }
            },
            required: ['count_session_id', 'product_id', 'quantity']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            await convex.mutation(api.inventoryCounts.updateInventoryCount, {
                count_session_id: params.count_session_id,
                drink_id: params.product_id,
                quantity: params.quantity
            });

            return { success: true, message: 'Count updated successfully' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class CloseInventoryCountTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'close_inventory_count',
        description: 'Finalize inventory count and apply variances',
        parameters: {
            type: 'object',
            properties: {
                count_session_id: { type: 'string', description: 'Count session ID' }
            },
            required: ['count_session_id']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            const result = await convex.mutation(api.inventoryCounts.closeInventoryCount, {
                count_session_id: params.count_session_id
            });

            return {
                success: true,
                message: `Inventory count closed. ${result.items_updated} items updated.`
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}
