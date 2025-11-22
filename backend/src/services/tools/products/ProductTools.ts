import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class ReadProductTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'read_product',
        description: 'Retrieve full details for a product/SKU',
        parameters: {
            type: 'object',
            properties: {
                product_name: { type: 'string', description: 'Product name (e.g., "Bud Light")' }
            },
            required: ['product_name']
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

            return {
                success: true,
                product: {
                    ...product,
                    price: product.price / 100 // Convert to dollars
                }
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class UpdateProductTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'update_product',
        description: 'Update attributes of an existing product/SKU',
        parameters: {
            type: 'object',
            properties: {
                product_name: { type: 'string', description: 'Product name (e.g., "Bud Light")' },
                updates: { type: 'object', description: 'Fields to update (price, inventory, name, etc.)' }
            },
            required: ['product_name', 'updates']
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

            // Convert price to cents if provided
            const updates = { ...params.updates };
            if (updates.price) {
                updates.price = Math.round(updates.price * 100);
            }

            await convex.mutation(api.products.updateProduct, {
                product_id: product._id,
                updates
            });

            return { success: true, message: `${product.name} updated successfully` };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class ArchiveProductTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'archive_product',
        description: 'Soft-delete a product while retaining its history',
        parameters: {
            type: 'object',
            properties: {
                product_id: { type: 'string', description: 'Product ID' },
                reason: { type: 'string', description: 'Reason for archiving' }
            },
            required: ['product_id']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            await convex.mutation(api.products.archiveProduct, {
                product_id: params.product_id,
                reason: params.reason
            });

            return { success: true, message: 'Product archived successfully' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}
