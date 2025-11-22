import { ToolDefinition, ToolExecutor, ToolContext } from '../types.js';

export class TerminateSessionTool implements ToolExecutor {
    definition: ToolDefinition = {
        type: 'function',
        name: 'terminate_session',
        description: 'Ends the current voice session and returns to wake word listening mode. Call this when the user says "Goodbye", "That\'s all", or indicates they are done.',
        parameters: {
            type: 'object',
            properties: {
                reason: {
                    type: 'string',
                    description: 'Reason for termination'
                }
            },
            required: ['reason']
        }
    };

    async execute(args: { reason: string }, context: ToolContext): Promise<any> {
        return { success: true, message: "Session terminated" };
    }
}
