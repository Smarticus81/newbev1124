import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to normalize strings for matching (remove accents, lowercase, trim)
const normalize = (str: string): string => {
    return str
        .normalize("NFD") // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .toLowerCase()
        .trim();
};

// Calculate similarity score (0-1, higher is better)
const similarity = (query: string, target: string): number => {
    const normQuery = normalize(query);
    const normTarget = normalize(target);

    // Exact match after normalization = 1.0
    if (normQuery === normTarget) return 1.0;

    // Starts with = 0.9
    if (normTarget.startsWith(normQuery)) return 0.9;

    // Contains = 0.7
    if (normTarget.includes(normQuery)) return 0.7;

    // Word boundary match = 0.8
    const words = normTarget.split(/\s+/);
    if (words.some(w => w.startsWith(normQuery))) return 0.8;

    return 0;
};

// Search drinks by name or category
export const searchDrinks = query({
    args: {
        query: v.string(),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let drinks;

        if (args.category) {
            drinks = await ctx.db
                .query("drinks")
                .withIndex("by_category", (q) => q.eq("category", args.category!))
                .collect();
        } else {
            drinks = await ctx.db.query("drinks").collect();
        }

        // Fuzzy search with scoring
        if (args.query) {
            const scoredDrinks = drinks
                .map((d) => ({
                    drink: d,
                    score: Math.max(
                        similarity(args.query, d.name),
                        similarity(args.query, d.description || "") * 0.5
                    )
                }))
                .filter((sd) => sd.score > 0.6) // Minimum threshold
                .sort((a, b) => b.score - a.score); // Best match first

            return scoredDrinks.map((sd) => sd.drink);
        }

        return drinks;
    },
});

// Check inventory for a specific drink
export const checkInventory = query({
    args: {
        drinkId: v.id("drinks"),
    },
    handler: async (ctx, args) => {
        const drink = await ctx.db.get(args.drinkId);
        if (!drink) return null;

        // Get detailed inventory items
        const inventoryItems = await ctx.db
            .query("inventory")
            .withIndex("by_drink", (q) => q.eq("drink_id", args.drinkId))
            .collect();

        return {
            drink,
            total_inventory: drink.inventory,
            total_inventory_oz: drink.inventory_oz,
            items: inventoryItems,
        };
    },
});

// Update inventory (e.g. after a pour or restock)
export const updateInventory = mutation({
    args: {
        drinkId: v.id("drinks"),
        quantityChange: v.number(), // Can be negative
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const drink = await ctx.db.get(args.drinkId);
        if (!drink) throw new Error("Drink not found");

        const newInventory = drink.inventory + args.quantityChange;

        await ctx.db.patch(args.drinkId, {
            inventory: newInventory,
            updated_at: Date.now(),
        });

        // Log movement
        await ctx.db.insert("inventory_movements", {
            drink_id: args.drinkId,
            movement_type: args.quantityChange > 0 ? "restock" : "sale",
            quantity_change: args.quantityChange,
            reason: args.reason,
            created_at: Date.now(),
        });

        return newInventory;
    },
});

export const listLowStock = query({
    handler: async (ctx) => {
        const drinks = await ctx.db.query("drinks").collect();
        return drinks.filter(d => d.inventory < 10);
    },
});

// Create a new drink
export const createDrink = mutation({
    args: {
        name: v.string(),
        category: v.string(),
        price: v.number(),
        description: v.optional(v.string()),
        inventory: v.number(),
        inventory_oz: v.number(),
        image_url: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const drinkId = await ctx.db.insert("drinks", {
            name: args.name,
            category: args.category,
            subcategory: undefined,
            price: args.price,
            inventory: args.inventory,
            inventory_oz: args.inventory_oz,
            unit_type: "bottle",
            unit_volume_oz: undefined,
            serving_size_oz: undefined,
            servings_per_container: undefined,
            cost_per_unit: undefined,
            profit_margin: undefined,
            popularity_score: 0,
            tax_category_id: undefined,
            image_url: args.image_url,
            description: args.description,
            is_active: true,
            created_at: now,
            updated_at: now,
        });
        return drinkId;
    },
});

// Update drink image
export const updateDrinkImage = mutation({
    args: {
        drinkId: v.id("drinks"),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.drinkId, {
            image_url: args.imageUrl,
            updated_at: Date.now(),
        });
        return true;
    },
});

// List all drinks
export const listDrinks = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("drinks")
            .filter((q) => q.eq(q.field("is_active"), true))
            .collect();
    },
});
