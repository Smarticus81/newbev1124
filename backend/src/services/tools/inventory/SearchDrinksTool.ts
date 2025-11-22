import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';
import { convex } from '../../../lib/convex.js';
import { api } from '../../../../convex/_generated/api.js';

export class SearchDrinksTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'search_drinks',
        description: 'Search for drinks by name or type/category',
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search term for drinks (name or category like "beer", "wine", etc.)'
                }
            },
            required: ['query']
        }
    };

    async execute(params: { query: string }, context: ToolContext) {
        const { query } = params;

        const products = await convex.query(api.drinks.searchDrinks, { query });

        if (!products || products.length === 0) {
            return {
                success: true,
                message: `No drinks found matching "${query}"`,
                results: []
            };
        }

        return {
            success: true,
            message: `Found ${products.length} drinks matching "${query}"`,
            results: products.map(p => ({
                name: p.name,
                category: p.category,
                price: p.price,
                quantity: p.inventory
            }))
        };
    }
}
