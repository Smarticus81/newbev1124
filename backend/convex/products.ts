import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new product (extends drinks functionality)
export const createProduct = mutation({
    args: {
        name: v.string(),
        category: v.string(),
        subcategory: v.optional(v.string()),
        unit_type: v.string(),
        price: v.optional(v.number()),
        inventory: v.optional(v.number()),
        is_active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const productId = await ctx.db.insert("drinks", {
            name: args.name,
            category: args.category,
            subcategory: args.subcategory || "",
            unit_type: args.unit_type,
            price: args.price || 0,
            inventory: args.inventory || 0,
            inventory_oz: (args.inventory || 0) * 25.4,
            unit_volume_oz: 25.4,
            serving_size_oz: 1.5,
            servings_per_container: 16,
            popularity_score: 0,
            is_active: args.is_active !== undefined ? args.is_active : true,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        return productId;
    },
});

// Read a single product
export const readProduct = query({
    args: {
        product_id: v.id("drinks"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.product_id);
    },
});

// Update an existing product
export const updateProduct = mutation({
    args: {
        product_id: v.id("drinks"),
        updates: v.object({
            name: v.optional(v.string()),
            category: v.optional(v.string()),
            subcategory: v.optional(v.string()),
            price: v.optional(v.number()),
            inventory: v.optional(v.number()),
            is_active: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.product_id, {
            ...args.updates,
            updated_at: Date.now(),
        });
        return { success: true };
    },
});

// Archive a product (soft delete)
export const archiveProduct = mutation({
    args: {
        product_id: v.id("drinks"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.product_id, {
            is_active: false,
            updated_at: Date.now(),
        });
        return { success: true, reason: args.reason };
    },
});
