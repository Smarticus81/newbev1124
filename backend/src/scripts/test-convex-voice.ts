import { AddToCartTool } from '../services/tools/cart/AddToCartTool.js';
import { ToolContext } from '../services/tools/types.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('Starting Convex Voice Integration Test...');

    // Mock context
    const context: ToolContext = {
        sessionId: 'test-session-' + Date.now(),
        venueId: 'venue-1', // Assuming this exists or isn't strictly checked yet
        action: 'add_to_cart'
    };

    console.log(`Using Session ID: ${context.sessionId}`);

    // Test AddToCartTool
    const addToCartTool = new AddToCartTool();

    try {
        console.log('\nTesting AddToCartTool...');
        // We need a drink that exists. Since we can't easily seed, we'll try a common one
        // or rely on the user to have some data. 
        // Actually, let's try to search first if we can, but the tool does that.
        // We'll try "Beer".
        const result = await addToCartTool.execute({ drink_name: 'Beer', quantity: 2 }, context);
        console.log('AddToCart Result:', JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('AddToCart Failed:', error.message);
        if (error.message.includes('not found')) {
            console.log('Tip: Ensure you have a drink named "Beer" in your Convex database.');
        }
    }

    console.log('\nTest Complete.');
}

main().catch(console.error);
