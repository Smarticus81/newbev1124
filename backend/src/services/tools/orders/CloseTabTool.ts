import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class CloseTabTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'close_tab',
        description: 'Close and pay for a tab by customer name',
        parameters: {
            type: 'object',
            properties: {
                customer_name: {
                    type: 'string',
                    description: 'Name of the customer whose tab to close'
                },
                payment_method: {
                    type: 'string',
                    description: 'Payment method (card, cash, etc.)',
                    enum: ['card', 'cash', 'voice_simulated']
                }
            },
            required: ['customer_name']
        }
    };

    async execute(params: { customer_name: string; payment_method?: string }, context: ToolContext) {
        try {
            // Find the pending order by customer name
            const tabs = await convex.query(api.orders.listPendingOrders, {});
            const tab = tabs.find((t: any) =>
                t.order_name?.toLowerCase() === params.customer_name.toLowerCase()
            );

            if (!tab) {
                return {
                    success: false,
                    message: `No open tab found for ${params.customer_name}`
                };
            }

            // Process payment
            const result = await convex.mutation(api.orders.processPayment, {
                orderId: tab._id,
                paymentMethod: params.payment_method || 'voice_simulated',
                customerName: params.customer_name
            });

            return {
                success: true,
                message: `Tab closed for ${params.customer_name}. Total: $${(result.total / 100).toFixed(2)}`,
                orderId: result.orderId,
                total: result.total / 100
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to close tab'
            };
        }
    }
}
