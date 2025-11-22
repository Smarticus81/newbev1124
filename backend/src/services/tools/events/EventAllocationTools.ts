import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class CreateEventAllocationTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'create_event_allocation',
        description: 'Allocate inventory to an event (e.g., a wedding)',
        parameters: {
            type: 'object',
            properties: {
                event_id: { type: 'string', description: 'Event booking ID' },
                product_name: { type: 'string', description: 'Product name (e.g., "Champagne")' },
                quantity: { type: 'number', description: 'Quantity to allocate' }
            },
            required: ['event_id', 'product_name', 'quantity']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            // Search for product by name
            const products = await convex.query(api.drinks.searchDrinks, {
                query: params.product_name
            });

            if (!products || products.length === 0) {
                return { success: false, message: `Product "${params.product_name}" not found` };
            }

            const product = products[0];

            const allocationId = await convex.mutation(api.eventAllocations.createEventAllocation, {
                event_booking_id: params.event_id,
                drink_id: product._id,
                allocated_quantity: params.quantity
            });

            return {
                success: true,
                message: `Allocated ${params.quantity} units of ${product.name} to event`,
                allocationId
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class UpdateEventConsumptionTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'update_event_consumption',
        description: 'Update actual consumption for an event',
        parameters: {
            type: 'object',
            properties: {
                event_id: { type: 'string', description: 'Event booking ID' },
                product_name: { type: 'string', description: 'Product name (e.g., "Champagne")' },
                quantity_used: { type: 'number', description: 'Quantity consumed' }
            },
            required: ['event_id', 'product_name', 'quantity_used']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            // Search for product by name
            const products = await convex.query(api.drinks.searchDrinks, {
                query: params.product_name
            });

            if (!products || products.length === 0) {
                return { success: false, message: `Product "${params.product_name}" not found` };
            }

            const product = products[0];

            await convex.mutation(api.eventAllocations.updateEventConsumption, {
                event_booking_id: params.event_id,
                drink_id: product._id,
                quantity_used: params.quantity_used
            });

            return { success: true, message: `Event consumption updated for ${product.name}` };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class CloseEventInventoryTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'close_event_inventory',
        description: 'Close the event and lock consumption values',
        parameters: {
            type: 'object',
            properties: {
                event_id: { type: 'string', description: 'Event booking ID' }
            },
            required: ['event_id']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            const result = await convex.mutation(api.eventAllocations.closeEventInventory, {
                event_booking_id: params.event_id
            });

            return {
                success: true,
                message: `Event closed. ${result.allocations_closed} allocations finalized.`
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}
