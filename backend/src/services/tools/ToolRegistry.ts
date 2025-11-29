import { ToolDefinition, ToolExecutor, ToolContext } from './types.js';
import { logger } from '../../utils/logger.js';

// Import tools
import { AddToCartTool } from './cart/AddToCartTool.js';
import { AddMultipleToCartTool } from './cart/AddMultipleToCartTool.js';
import { RemoveFromCartTool } from './cart/RemoveFromCartTool.js';
import { ShowCartTool } from './cart/ShowCartTool.js';
import { ClearCartTool } from './cart/ClearCartTool.js';
import { CheckInventoryTool } from './inventory/CheckInventoryTool.js';
import { SearchDrinksTool } from './inventory/SearchDrinksTool.js';
import { ProcessOrderTool } from './orders/ProcessOrderTool.js';
import { GetOrdersListTool } from './orders/GetOrdersListTool.js';
import { CreateTabTool } from './orders/CreateTabTool.js';
import { CloseTabTool } from './orders/CloseTabTool.js';
import { VoidTransactionTool } from './orders/VoidTransactionTool.js';
import { NavigateToScreenTool } from './navigation/NavigateToScreenTool.js';
import { TerminateSessionTool } from './system/TerminateSessionTool.js';

// Product & Category tools
import { CreateProductTool } from './products/CreateProductTool.js';
import { ReadProductTool, UpdateProductTool, ArchiveProductTool } from './products/ProductTools.js';
import { CreateCategoryTool, UpdateCategoryTool, DeleteCategoryTool } from './products/CategoryTools.js';

// Inventory tools
import { StartInventoryCountTool, UpdateInventoryCountTool, CloseInventoryCountTool } from './inventory/InventoryCountTools.js';
import { CreateAdjustmentTool, ReadAdjustmentHistoryTool, VoidAdjustmentTool } from './inventory/AdjustmentTools.js';

// Event tools
import { CreateEventAllocationTool, UpdateEventConsumptionTool, CloseEventInventoryTool } from './events/EventAllocationTools.js';

export class ToolRegistry {
    private tools: Map<string, { definition: ToolDefinition; executor: ToolExecutor }> = new Map();

    constructor() {
        this.registerTools();
    }

    private registerTools() {
        // Cart tools
        this.register(new AddToCartTool());
        this.register(new AddMultipleToCartTool());
        this.register(new RemoveFromCartTool());
        this.register(new ShowCartTool());
        this.register(new ClearCartTool());

        // Inventory tools
        this.register(new CheckInventoryTool());
        this.register(new SearchDrinksTool());

        // Order tools
        this.register(new ProcessOrderTool());
        this.register(new GetOrdersListTool());
        this.register(new CreateTabTool());
        this.register(new CloseTabTool());
        this.register(new VoidTransactionTool());

        // Navigation tools
        this.register(new NavigateToScreenTool());

        // System tools
        this.register(new TerminateSessionTool());

        // Product & Category tools
        this.register(new CreateProductTool());
        this.register(new ReadProductTool());
        this.register(new UpdateProductTool());
        this.register(new ArchiveProductTool());
        this.register(new CreateCategoryTool());
        this.register(new UpdateCategoryTool());
        this.register(new DeleteCategoryTool());

        // Inventory tools
        this.register(new StartInventoryCountTool());
        this.register(new UpdateInventoryCountTool());
        this.register(new CloseInventoryCountTool());
        this.register(new CreateAdjustmentTool());
        this.register(new ReadAdjustmentHistoryTool());
        this.register(new VoidAdjustmentTool());

        // Event tools
        this.register(new CreateEventAllocationTool());
        this.register(new UpdateEventConsumptionTool());
        this.register(new CloseEventInventoryTool());

        logger.info({ count: this.tools.size }, 'Tools registered');
    }

    private register(tool: ToolExecutor & { definition: ToolDefinition }) {
        this.tools.set(tool.definition.name, {
            definition: tool.definition,
            executor: tool,
        });
    }

    async execute(name: string, params: any, context: ToolContext): Promise<any> {
        const tool = this.tools.get(name);

        if (!tool) {
            throw new Error(`Tool "${name}" not found`);
        }

        logger.info({ name, params, sessionId: context.sessionId }, 'Executing tool');

        try {
            const result = await tool.executor.execute(params, context);
            return result;
        } catch (error: any) {
            logger.error({ error, name, params }, 'Tool execution failed');
            throw error;
        }
    }

    toGeminiTools(): any[] {
        return [{
            functionDeclarations: Array.from(this.tools.values()).map(tool => {
                const { type, ...def } = tool.definition;
                return def;
            })
        }];
    }

    /**
     * Convert tools to OpenAI function calling format
     */
    toOpenAITools(): any[] {
        return Array.from(this.tools.values()).map(tool => ({
            type: 'function',
            name: tool.definition.name,
            description: tool.definition.description,
            parameters: tool.definition.parameters
        }));
    }

    getAllTools(): ToolDefinition[] {
        return Array.from(this.tools.values()).map(t => t.definition);
    }
}
