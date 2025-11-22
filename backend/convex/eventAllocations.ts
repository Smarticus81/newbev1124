import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create event allocation
export const createEventAllocation = mutation({
    args: {
        event_booking_id: v.id("event_bookings"),
        drink_id: v.id("drinks"),
        allocated_quantity: v.number(),
    },
    handler: async (ctx, args) => {
        const allocationId = await ctx.db.insert("event_allocations", {
            event_booking_id: args.event_booking_id,
            drink_id: args.drink_id,
            allocated_quantity: args.allocated_quantity,
            consumed_quantity: 0,
            is_closed: false,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        return allocationId;
    },
});

// Update event consumption
export const updateEventConsumption = mutation({
    args: {
        event_booking_id: v.id("event_bookings"),
        drink_id: v.id("drinks"),
        quantity_used: v.number(),
    },
    handler: async (ctx, args) => {
        // Find allocation
        const allocation = await ctx.db
            .query("event_allocations")
            .withIndex("by_event", (q) => q.eq("event_booking_id", args.event_booking_id))
            .filter((q) => q.eq(q.field("drink_id"), args.drink_id))
            .first();

        if (!allocation) {
            throw new Error("Event allocation not found");
        }

        if (allocation.is_closed) {
            throw new Error("Event is already closed");
        }

        // Update consumed quantity
        await ctx.db.patch(allocation._id, {
            consumed_quantity: args.quantity_used,
            updated_at: Date.now(),
        });

        // Update product inventory
        const product = await ctx.db.get(args.drink_id);
        if (product) {
            const quantityChange = args.quantity_used - allocation.consumed_quantity;
            await ctx.db.patch(args.drink_id, {
                inventory: product.inventory - quantityChange,
                inventory_oz: (product.inventory - quantityChange) * 25.4,
                updated_at: Date.now(),
            });
        }

        return { success: true };
    },
});

// Close event inventory
export const closeEventInventory = mutation({
    args: {
        event_booking_id: v.id("event_bookings"),
    },
    handler: async (ctx, args) => {
        // Get all allocations for this event
        const allocations = await ctx.db
            .query("event_allocations")
            .withIndex("by_event", (q) => q.eq("event_booking_id", args.event_booking_id))
            .collect();

        // Close all allocations
        for (const allocation of allocations) {
            await ctx.db.patch(allocation._id, {
                is_closed: true,
                updated_at: Date.now(),
            });
        }

        return { success: true, allocations_closed: allocations.length };
    },
});

// Get event allocations
export const getEventAllocations = query({
    args: {
        event_booking_id: v.id("event_bookings"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("event_allocations")
            .withIndex("by_event", (q) => q.eq("event_booking_id", args.event_booking_id))
            .collect();
    },
});
