import { query } from "./_generated/server";
import { v } from "convex/values";

// List event bookings
export const listBookings = query({
    args: {
        status: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 20;
        let bookings;

        if (args.status) {
            // Note: We don't have a by_status index on event_bookings yet, 
            // so we'll filter in memory or just fetch all for now.
            // Ideally we should add an index.
            bookings = await ctx.db
                .query("event_bookings")
                .order("desc")
                .take(limit);

            bookings = bookings.filter(b => b.status === args.status);
        } else {
            bookings = await ctx.db
                .query("event_bookings")
                .withIndex("by_date")
                .order("desc")
                .take(limit);
        }

        // We need to join with package info
        // In Convex, joins are manual
        const bookingsWithPackage = await Promise.all(bookings.map(async (b) => {
            let pkg = null;
            if (b.package_id) {
                pkg = await ctx.db.get(b.package_id);
            }
            return {
                ...b,
                package: pkg
            };
        }));

        return bookingsWithPackage;
    },
});

// List event packages
export const listPackages = query({
    args: {
        activeOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const packages = await ctx.db.query("event_packages").collect();

        if (args.activeOnly) {
            return packages.filter(p => p.is_active);
        }

        return packages;
    },
});
