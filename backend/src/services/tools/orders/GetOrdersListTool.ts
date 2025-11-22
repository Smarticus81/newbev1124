import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class GetOrdersListTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'get_orders_list',
        description: 'Get list of recent orders',
        parameters: {
            type: 'object',
            properties: {
                limit: {
                    type: 'integer',
                    description: 'Number of orders to retrieve (default: 10)',
                    default: 10
                }
            }
        }
    };

    async execute(params: { limit?: number }, context: ToolContext) {
        const limit = params.limit || 10;

        const orders = await convex.query(api.orders.listOrders, { limit });

        return {
            success: true,
            message: `Retrieved ${orders.length} recent orders`,
            orders: orders.map((o: any) => ({
                id: o._id,
                name: o.order_name || o.table_number || 'Walk-in',
                total: o.total / 100,
                status: o.status,
                itemCount: o.items.length,
                createdAt: new Date(o.created_at).toISOString()
            }))
        };
    }
}
