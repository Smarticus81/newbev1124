import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';

export class NavigateToScreenTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'navigate_to_screen',
        description: 'Navigate to a different screen in the POS',
        parameters: {
            type: 'object',
            properties: {
                screen: {
                    type: 'string',
                    enum: ['menu', 'tabs', 'transactions', 'items', 'inventory'],
                    description: 'Screen to navigate to'
                }
            },
            required: ['screen']
        }
    };

    async execute(params: { screen: string }, context: ToolContext) {
        // This would emit an SSE event to the frontend to trigger navigation
        // For now, just return success

        return {
            success: true,
            message: `Navigating to ${params.screen} screen`,
            screen: params.screen
        };
    }
}
