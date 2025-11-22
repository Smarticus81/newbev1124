import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new category
export const createCategory = mutation({
    args: {
        name: v.string(),
        parent_id: v.optional(v.id("categories")),
    },
    handler: async (ctx, args) => {
        const categoryId = await ctx.db.insert("categories", {
            name: args.name,
            parent_id: args.parent_id,
            is_active: true,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        return categoryId;
    },
});

// Update an existing category
export const updateCategory = mutation({
    args: {
        category_id: v.id("categories"),
        updates: v.object({
            name: v.optional(v.string()),
            parent_id: v.optional(v.id("categories")),
            is_active: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.category_id, {
            ...args.updates,
            updated_at: Date.now(),
        });
        return { success: true };
    },
});

// Soft delete a category
export const deleteCategory = mutation({
    args: {
        category_id: v.id("categories"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.category_id, {
            is_active: false,
            updated_at: Date.now(),
        });
        return { success: true };
    },
});

// List all categories
export const listCategories = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("categories")
            .filter((q) => q.eq(q.field("is_active"), true))
            .collect();
    },
});
