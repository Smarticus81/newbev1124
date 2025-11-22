import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { DRINK_RECIPES, UNIT_CONVERSIONS } from "./recipes";

// Force redeploy

// Create a new order
export const createOrder = mutation({
    args: {
        customerId: v.optional(v.id("customers")),
        staffId: v.optional(v.id("staff")),
        sessionId: v.optional(v.string()),
        tableNumber: v.optional(v.string()),
        items: v.array(v.object({
            drinkId: v.id("drinks"),
            quantity: v.number(),
            price: v.number(),
            name: v.string(),
        })),
        customerName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Calculate totals
        const subtotal = args.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.08; // Example tax rate
        const taxAmount = Math.round(subtotal * taxRate);
        const total = subtotal + taxAmount;

        const orderId = await ctx.db.insert("orders", {
            customer_id: args.customerId,
            staff_id: args.staffId,
            session_id: args.sessionId,
            table_number: args.tableNumber,
            items: args.items,
            subtotal,
            tax_amount: taxAmount,
            total,
            status: "pending",
            payment_status: "pending",
            created_at: Date.now(),
            updated_at: Date.now(),
            discount_amount: 0,
            tip_amount: 0,
            order_name: args.customerName,
        });

        return orderId;
    },
});

// Add item to an existing order (or create if not exists)
export const addToOrder = mutation({
    args: {
        orderId: v.optional(v.id("orders")), // If provided, use this
        sessionId: v.optional(v.string()), // If provided and no orderId, find pending order for session
        drinkId: v.id("drinks"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        let orderId = args.orderId;
        let order = null;

        if (orderId) {
            order = await ctx.db.get(orderId);
        } else if (args.sessionId) {
            // Find pending order for session
            const orders = await ctx.db
                .query("orders")
                .withIndex("by_session", (q) => q.eq("session_id", args.sessionId!))
                .filter((q) => q.eq(q.field("status"), "pending"))
                .collect();

            if (orders.length > 0) {
                order = orders[0];
                orderId = order._id;
            }
        }

        const drink = await ctx.db.get(args.drinkId);
        if (!drink) throw new Error("Drink not found");

        const newItem = {
            drinkId: args.drinkId,
            quantity: args.quantity,
            price: drink.price,
            name: drink.name,
        };

        if (order) {
            // Update existing order
            // Check if item exists to merge
            const existingItemIndex = order.items.findIndex((i: any) => i.drinkId === args.drinkId);
            let newItems = [...order.items];

            if (existingItemIndex >= 0) {
                newItems[existingItemIndex].quantity += args.quantity;
            } else {
                newItems.push(newItem);
            }

            // Recalculate totals
            const subtotal = newItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            const taxRate = 0.08;
            const taxAmount = Math.round(subtotal * taxRate);
            const total = subtotal + taxAmount;

            await ctx.db.patch(orderId!, {
                items: newItems,
                subtotal,
                tax_amount: taxAmount,
                total,
                updated_at: Date.now(),
            });
        } else {
            // Create new order
            const subtotal = newItem.price * newItem.quantity;
            const taxRate = 0.08;
            const taxAmount = Math.round(subtotal * taxRate);
            const total = subtotal + taxAmount;

            orderId = await ctx.db.insert("orders", {
                session_id: args.sessionId,
                items: [newItem],
                subtotal,
                tax_amount: taxAmount,
                total,
                status: "pending",
                payment_status: "pending",
                created_at: Date.now(),
                updated_at: Date.now(),
                discount_amount: 0,
                tip_amount: 0,
            });
        }

        return orderId;
    },
});

// Get current cart/order for session or by ID
export const getCart = query({
    args: {
        sessionId: v.optional(v.string()),
        orderId: v.optional(v.id("orders")),
    },
    handler: async (ctx, args) => {
        if (args.orderId) {
            const order = await ctx.db.get(args.orderId);
            if (order && order.status === 'pending') {
                return order;
            }
            return null;
        }

        if (args.sessionId) {
            const orders = await ctx.db
                .query("orders")
                .withIndex("by_session", (q) => q.eq("session_id", args.sessionId!))
                .filter((q) => q.eq(q.field("status"), "pending"))
                .collect();

            if (orders.length === 0) return null;
            return orders[0];
        }

        return null;
    },
});

// Remove item from cart
export const removeFromCart = mutation({
    args: {
        sessionId: v.string(),
        drinkName: v.string(), // Fuzzy match name since voice might not be exact
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_session", (q) => q.eq("session_id", args.sessionId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        if (orders.length === 0) throw new Error("No active cart found");
        const order = orders[0];

        // Find item by name (fuzzy)
        const lowerName = args.drinkName.toLowerCase();
        const itemIndex = order.items.findIndex((i: any) => i.name.toLowerCase().includes(lowerName));

        if (itemIndex === -1) throw new Error(`Item "${args.drinkName}" not found in cart`);

        let newItems = [...order.items];
        const item = newItems[itemIndex];
        let removed = false;
        let remaining = 0;

        if (item.quantity <= args.quantity) {
            // Remove entirely
            newItems.splice(itemIndex, 1);
            removed = true;
        } else {
            // Decrease quantity
            item.quantity -= args.quantity;
            remaining = item.quantity;
        }

        // Recalculate totals
        const subtotal = newItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.08;
        const taxAmount = Math.round(subtotal * taxRate);
        const total = subtotal + taxAmount;

        await ctx.db.patch(order._id, {
            items: newItems,
            subtotal,
            tax_amount: taxAmount,
            total,
            updated_at: Date.now(),
        });

        return {
            success: true,
            removed,
            remaining,
            itemName: item.name
        };
    },
});

// Clear cart
export const clearCart = mutation({
    args: {
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_session", (q) => q.eq("session_id", args.sessionId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        if (orders.length === 0) return { count: 0 };

        // We could delete the order or just clear items. Let's delete the order to reset.
        await ctx.db.delete(orders[0]._id);

        return { count: orders[0].items.length };
    },
});

// Process payment for an order (and complete it)
export const processPayment = mutation({
    args: {
        orderId: v.optional(v.id("orders")),
        sessionId: v.optional(v.string()),
        paymentMethod: v.string(),
        amount: v.optional(v.number()), // If not provided, use order total
        customerName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let orderId = args.orderId;
        let order;

        if (orderId) {
            order = await ctx.db.get(orderId);
        } else if (args.sessionId) {
            const orders = await ctx.db
                .query("orders")
                .withIndex("by_session", (q) => q.eq("session_id", args.sessionId!))
                .filter((q) => q.eq(q.field("status"), "pending"))
                .collect();

            if (orders.length > 0) {
                order = orders[0];
                orderId = order._id;
            }
        }

        if (!order || !orderId) throw new Error("Order not found");

        const amount = args.amount || order.total;

        // In a real app, we'd integrate with Stripe/Square here via an Action
        // For now, we just record the transaction

        await ctx.db.insert("transactions", {
            order_id: orderId,
            transaction_type: "sale",
            amount: amount,
            payment_method: args.paymentMethod,
            status: "completed",
            fees: 0,
            refund_amount: 0,
            created_at: Date.now(),
        });

        // Update inventory
        for (const item of order.items) {
            const recipe = DRINK_RECIPES[item.name];

            if (recipe) {
                // Reduce inventory for each ingredient
                for (const ingredient of recipe.ingredients) {
                    // Find the ingredient drink in DB
                    const ingredientDrink = await ctx.db
                        .query("drinks")
                        .filter(q => q.eq(q.field("name"), ingredient.name))
                        .first();

                    if (ingredientDrink) {
                        let quantityToSubtract = 0;

                        if (ingredient.unit === 'unit') {
                            // Bottles/Cans - subtract whole units
                            quantityToSubtract = ingredient.quantity * item.quantity;
                        } else if (ingredient.unit === 'oz') {
                            // Liquor/Wine - convert oz to bottles
                            // Default to 750ml (25.36oz) if not known.
                            const bottleSize = ingredientDrink.unit_volume_oz || UNIT_CONVERSIONS.BOTTLE_OZ;
                            quantityToSubtract = (ingredient.quantity * item.quantity) / bottleSize;
                        }

                        const newInventory = (ingredientDrink.inventory || 0) - quantityToSubtract;

                        await ctx.db.patch(ingredientDrink._id, {
                            inventory: newInventory,
                            updated_at: Date.now(),
                        });

                        // Log movement
                        await ctx.db.insert("inventory_movements", {
                            drink_id: ingredientDrink._id,
                            movement_type: "sale",
                            quantity_change: -quantityToSubtract,
                            reason: "order_sale",
                            created_at: Date.now(),
                        });
                    }
                }
            } else {
                // Fallback: Direct decrement
                const drink = await ctx.db.get(item.drinkId as Id<"drinks">);
                if (drink) {
                    const newInventory = (drink.inventory || 0) - item.quantity;
                    await ctx.db.patch(item.drinkId, {
                        inventory: newInventory,
                        updated_at: Date.now(),
                    });

                    await ctx.db.insert("inventory_movements", {
                        drink_id: item.drinkId,
                        movement_type: "sale",
                        quantity_change: -item.quantity,
                        reason: "order_sale",
                        created_at: Date.now(),
                    });
                }
            }
        }

        await ctx.db.patch(orderId, {
            payment_status: "completed",
            status: "completed",
            order_name: args.customerName,
            updated_at: Date.now(),
        });

        return {
            success: true,
            orderId,
            total: amount
        };
    },
});

// List recent orders
export const listOrders = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_status") // We might want a by_created_at index or just sort
            .order("desc")
            .take(limit);

        return orders;
    },
});

// List completed orders
export const listCompletedOrders = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 20;
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_status_created", (q) => q.eq("status", "completed"))
            .order("desc")
            .take(limit);

        return orders;
    },
});

// List pending orders (Tabs)
export const listPendingOrders = query({
    args: {},
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .order("desc")
            .collect();

        return orders;
    },
});

// Get a single order by ID
export const getOrder = query({
    args: {
        orderId: v.id("orders"),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        return order;
    },
});

// Void an order (Cancel a Tab)
export const voidOrder = mutation({
    args: {
        orderId: v.id("orders"),
    },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found");

        await ctx.db.patch(args.orderId, {
            status: "cancelled",
            updated_at: Date.now(),
        });

        return { success: true };
    },
});
