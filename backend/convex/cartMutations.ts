import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Update item quantity in cart
export const updateItemQuantity = mutation({
    args: {
        sessionId: v.string(),
        drinkId: v.id("drinks"),
        quantity: v.number(), // New quantity (NOT delta)
    },
    handler: async (ctx, args) => {
        // Find pending order for this session
        const order = await ctx.db
            .query("orders")
            .filter((q) => q.and(
                q.eq(q.field("session_id"), args.sessionId),
                q.eq(q.field("status"), "pending")
            ))
            .first();

        if (!order) {
            throw new Error("No active cart found");
        }

        if (args.quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const updatedItems = order.items.filter((item: any) => item.drinkId !== args.drinkId);

            // Recalculate totals
            const subtotal = updatedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            const taxAmount = Math.round(subtotal * 0.0825);
            const total = subtotal + taxAmount;

            await ctx.db.patch(order._id, {
                items: updatedItems,
                subtotal,
                tax_amount: taxAmount,
                total,
                updated_at: Date.now(),
            });

            return { success: true, message: "Item removed" };
        }

        // Update quantity
        const updatedItems = order.items.map((item: any) =>
            item.drinkId === args.drinkId
                ? { ...item, quantity: args.quantity }
                : item
        );

        // Recalculate totals
        const subtotal = updatedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const taxAmount = Math.round(subtotal * 0.0825);
        const total = subtotal + taxAmount;

        await ctx.db.patch(order._id, {
            items: updatedItems,
            subtotal,
            tax_amount: taxAmount,
            total,
            updated_at: Date.now(),
        });

        return { success: true, message: "Quantity updated" };
    },
});

// Remove item completely from cart
export const removeItemFromCart = mutation({
    args: {
        sessionId: v.string(),
        drinkId: v.id("drinks"),
    },
    handler: async (ctx, args) => {
        // Find pending order for this session
        const order = await ctx.db
            .query("orders")
            .filter((q) => q.and(
                q.eq(q.field("session_id"), args.sessionId),
                q.eq(q.field("status"), "pending")
            ))
            .first();

        if (!order) {
            throw new Error("No active cart found");
        }

        const updatedItems = order.items.filter((item: any) => item.drinkId !== args.drinkId);

        // Recalculate totals
        const subtotal = updatedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const taxAmount = Math.round(subtotal * 0.0825);
        const total = subtotal + taxAmount;

        await ctx.db.patch(order._id, {
            items: updatedItems,
            subtotal,
            tax_amount: taxAmount,
            total,
            updated_at: Date.now(),
        });

        return { success: true, message: "Item removed" };
    },
});
