import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class CreateProductTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'create_product',
        description: 'Create a new product/SKU in BevPro inventory system',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Product name' },
                category: { type: 'string', description: 'Product category' },
                subcategory: { type: 'string', description: 'Product subcategory' },
                unit_type: { type: 'string', description: 'Unit of measure (bottle, can, glass, etc.)' },
                price: { type: 'number', description: 'Price in dollars' },
                inventory: { type: 'number', description: 'Initial inventory quantity' }
            },
            required: ['name', 'unit_type']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            const productId = await convex.mutation(api.products.createProduct, {
                name: params.name,
                category: params.category || 'Uncategorized',
                subcategory: params.subcategory,
                unit_type: params.unit_type,
                price: params.price ? Math.round(params.price * 100) : undefined,
                inventory: params.inventory
            });

            return {
                success: true,
                message: `Product "${params.name}" created successfully`,
                productId
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Failed to create product'
            };
        }
    }
}
