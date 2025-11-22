import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class VoidTransactionTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'void_transaction',
        description: 'Void a transaction or tab. This cancels the order.',
        parameters: {
            type: 'object',
            properties: {
                customer_name: {
                    type: 'string',
                    description: 'Name of the customer whose tab/transaction to void'
                }
            },
            required: ['customer_name']
        }
    };

    async execute(params: { customer_name: string }, context: ToolContext) {
        try {
            // Find the order by customer name (can be pending or completed)
            const pendingTabs = await convex.query(api.orders.listPendingOrders, {});
            const completedOrders = await convex.query(api.orders.listCompletedOrders, { limit: 50 });

            const allOrders = [...pendingTabs, ...completedOrders];
            const order = allOrders.find((o: any) =>
                o.order_name?.toLowerCase() === params.customer_name.toLowerCase()
            );

            if (!order) {
                return {
                    success: false,
                    message: `No transaction found for ${params.customer_name}`
                };
            }

            await convex.mutation(api.orders.voidOrder, {
                orderId: order._id
            });

            return {
                success: true,
                message: `Transaction voided for ${params.customer_name}`
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to void transaction'
            };
        }
    }
}
