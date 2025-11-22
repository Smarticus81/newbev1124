import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class CreateTabTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'create_tab',
        description: 'Create a new tab for a customer',
        parameters: {
            type: 'object',
            properties: {
                customer_name: {
                    type: 'string',
                    description: 'Name of the customer for the tab (e.g., "John", "Table 5")'
                }
            },
            required: ['customer_name']
        }
    };

    async execute(params: { customer_name: string }, context: ToolContext) {
        try {
            const orderId = await convex.mutation(api.orders.createOrder, {
                items: [],
                customerName: params.customer_name
            });

            return {
                success: true,
                message: `Tab created for ${params.customer_name}`,
                orderId
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to create tab'
            };
        }
    }
}
