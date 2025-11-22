import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create an inventory adjustment
export const createAdjustment = mutation({
    args: {
        drink_id: v.id("drinks"),
        location_name: v.string(),
        quantity: v.number(),
        adjustment_type: v.string(),
        note: v.optional(v.string()),
        created_by: v.optional(v.id("staff")),
    },
    handler: async (ctx, args) => {
        // Create adjustment record
        const adjustmentId = await ctx.db.insert("inventory_adjustments", {
            drink_id: args.drink_id,
            location_name: args.location_name,
            quantity: args.quantity,
            adjustment_type: args.adjustment_type,
            note: args.note,
            created_by: args.created_by,
            created_at: Date.now(),
            voided: false,
        });

        // Update product inventory
        const product = await ctx.db.get(args.drink_id);
        if (product) {
            await ctx.db.patch(args.drink_id, {
                inventory: product.inventory + args.quantity,
                inventory_oz: (product.inventory + args.quantity) * 25.4,
                updated_at: Date.now(),
            });
        }

        return adjustmentId;
    },
});

// Read adjustment history for a product
export const readAdjustmentHistory = query({
    args: {
        drink_id: v.optional(v.id("drinks")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (args.drink_id) {
            const adjustments = await ctx.db
                .query("inventory_adjustments")
                .withIndex("by_drink", (q) => q.eq("drink_id", args.drink_id!))
                .order("desc")
                .take(args.limit || 50);
            return adjustments;
        } else {
            const adjustments = await ctx.db
                .query("inventory_adjustments")
                .withIndex("by_created")
                .order("desc")
                .take(args.limit || 50);
            return adjustments;
        }
    },
});

// Void an adjustment
export const voidAdjustment = mutation({
    args: {
        adjustment_id: v.id("inventory_adjustments"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const adjustment = await ctx.db.get(args.adjustment_id);
        if (!adjustment) {
            throw new Error("Adjustment not found");
        }

        if (adjustment.voided) {
            throw new Error("Adjustment already voided");
        }

        // Reverse the inventory change
        const product = await ctx.db.get(adjustment.drink_id);
        if (product) {
            await ctx.db.patch(adjustment.drink_id, {
                inventory: product.inventory - adjustment.quantity,
                inventory_oz: (product.inventory - adjustment.quantity) * 25.4,
                updated_at: Date.now(),
            });
        }

        // Mark adjustment as voided
        await ctx.db.patch(args.adjustment_id, {
            voided: true,
            void_reason: args.reason,
        });

        return { success: true };
    },
});
