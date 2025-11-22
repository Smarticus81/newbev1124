import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class ProcessOrderTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'process_order',
        description: 'Process and complete the current order',
        parameters: {
            type: 'object',
            properties: {
                customer_name: {
                    type: 'string',
                    description: 'Optional customer/table name'
                }
            }
        }
    };

    async execute(params: { customer_name?: string }, context: ToolContext) {
        try {
            // We assume the current session has a pending order
            const result = await convex.mutation(api.orders.processPayment, {
                sessionId: context.sessionId,
                paymentMethod: 'voice_simulated', // Default for now
                customerName: params.customer_name
            });

            return {
                success: true,
                message: `Order completed! Total: $${(result.total / 100).toFixed(2)}`,
                orderId: result.orderId,
                total: result.total / 100
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to process order'
            };
        }
    }
}
