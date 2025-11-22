export interface ToolContext {
    sessionId: string;
    venueId: number;
}

export interface ToolDefinition {
    type: 'function';
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}

export interface ToolExecutor {
    execute(params: any, context: ToolContext): Promise<any>;
}
