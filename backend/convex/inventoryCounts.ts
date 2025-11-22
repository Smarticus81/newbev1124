import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Start a new inventory count session
export const startInventoryCount = mutation({
    args: {
        location_name: v.string(),
        count_name: v.optional(v.string()),
        started_by: v.optional(v.id("staff")),
    },
    handler: async (ctx, args) => {
        const sessionId = await ctx.db.insert("inventory_count_sessions", {
            location_name: args.location_name,
            count_name: args.count_name,
            status: "in_progress",
            started_by: args.started_by,
            started_at: Date.now(),
        });
        return sessionId;
    },
});

// Update inventory count for a specific product
export const updateInventoryCount = mutation({
    args: {
        count_session_id: v.id("inventory_count_sessions"),
        drink_id: v.id("drinks"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        // Check if item already counted in this session
        const existing = await ctx.db
            .query("inventory_count_items")
            .withIndex("by_session", (q) => q.eq("count_session_id", args.count_session_id))
            .filter((q) => q.eq(q.field("drink_id"), args.drink_id))
            .first();

        if (existing) {
            // Update existing count
            await ctx.db.patch(existing._id, {
                quantity: args.quantity,
            });
        } else {
            // Create new count item
            await ctx.db.insert("inventory_count_items", {
                count_session_id: args.count_session_id,
                drink_id: args.drink_id,
                quantity: args.quantity,
                created_at: Date.now(),
            });
        }
        return { success: true };
    },
});

// Close inventory count and apply variances
export const closeInventoryCount = mutation({
    args: {
        count_session_id: v.id("inventory_count_sessions"),
    },
    handler: async (ctx, args) => {
        // Get all counted items
        const countedItems = await ctx.db
            .query("inventory_count_items")
            .withIndex("by_session", (q) => q.eq("count_session_id", args.count_session_id))
            .collect();

        // Update inventory for each counted item
        for (const item of countedItems) {
            await ctx.db.patch(item.drink_id, {
                inventory: item.quantity,
                inventory_oz: item.quantity * 25.4, // Assuming 25.4oz per bottle
                updated_at: Date.now(),
            });
        }

        // Mark session as completed
        await ctx.db.patch(args.count_session_id, {
            status: "completed",
            completed_at: Date.now(),
        });

        return { success: true, items_updated: countedItems.length };
    },
});

// Get inventory count session details
export const getInventoryCountSession = query({
    args: {
        count_session_id: v.id("inventory_count_sessions"),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.count_session_id);
        if (!session) return null;

        const items = await ctx.db
            .query("inventory_count_items")
            .withIndex("by_session", (q) => q.eq("count_session_id", args.count_session_id))
            .collect();

        return { ...session, items };
    },
});
