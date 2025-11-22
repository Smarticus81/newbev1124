import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class CreateCategoryTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'create_category',
        description: 'Create a new product category or subcategory',
        parameters: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Category name' },
                parent_id: { type: 'string', description: 'Parent category ID (for subcategories)' }
            },
            required: ['name']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            const categoryId = await convex.mutation(api.categories.createCategory, {
                name: params.name,
                parent_id: params.parent_id
            });

            return {
                success: true,
                message: `Category "${params.name}" created successfully`,
                categoryId
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class UpdateCategoryTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'update_category',
        description: 'Rename or update an existing category',
        parameters: {
            type: 'object',
            properties: {
                category_id: { type: 'string', description: 'Category ID' },
                updates: { type: 'object', description: 'Fields to update' }
            },
            required: ['category_id', 'updates']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            await convex.mutation(api.categories.updateCategory, {
                category_id: params.category_id,
                updates: params.updates
            });

            return { success: true, message: 'Category updated successfully' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

export class DeleteCategoryTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'delete_category',
        description: 'Delete or archive a category (soft-delete only)',
        parameters: {
            type: 'object',
            properties: {
                category_id: { type: 'string', description: 'Category ID' }
            },
            required: ['category_id']
        }
    };

    async execute(params: any, context: ToolContext) {
        try {
            await convex.mutation(api.categories.deleteCategory, {
                category_id: params.category_id
            });

            return { success: true, message: 'Category deleted successfully' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}
