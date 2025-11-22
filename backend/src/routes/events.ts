import { Hono } from 'hono';
import { convex } from '../lib/convex.js';
import { api } from '../../convex/_generated/api.js';

export const eventRoutes = new Hono();

// Get event bookings
eventRoutes.get('/bookings', async (c) => {
    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '20');

    const bookings = await convex.query(api.events.listBookings, {
        status: status || undefined,
        limit
    });

    // Map to frontend model
    const mappedBookings = bookings.map(b => ({
        id: b._id,
        eventName: b.event_name,
        eventType: b.event_type,
        eventDate: b.event_date,
        startTime: b.start_time,
        endTime: b.end_time,
        guestCount: b.guest_count,
        status: b.status,
        package: b.package ? {
            id: b.package._id,
            name: b.package.name,
            pricePerGuest: b.package.price_per_person,
        } : null,
        createdAt: new Date(b.created_at).toISOString(),
    }));

    return c.json({ bookings: mappedBookings });
});

// Get event packages
eventRoutes.get('/packages', async (c) => {
    const activeOnly = c.req.query('active') === 'true';

    const packages = await convex.query(api.events.listPackages, { activeOnly });

    // Map to frontend model
    const mappedPackages = packages.map(p => ({
        id: p._id,
        name: p.name,
        description: p.description,
        pricePerGuest: p.price_per_person,
        minGuests: p.min_guests,
        maxGuests: p.max_guests,
        features: [], // We don't have features in DB yet, or it's JSON
        createdAt: new Date(p.created_at).toISOString(),
        updatedAt: new Date(p.updated_at).toISOString(),
    }));

    return c.json({ packages: mappedPackages });
});
