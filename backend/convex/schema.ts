import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    tax_categories: defineTable({
        name: v.string(), // "Beer", "Wine", "Spirits"
        rate: v.string(), // Tax rate as string
        type: v.string(), // "per_pour", "percentage"
        description: v.optional(v.string()),
        applies_to: v.optional(v.any()), // JSON array
        is_active: v.boolean(),
        created_at: v.number(), // Timestamp
    }),

    categories: defineTable({
        name: v.string(),
        parent_id: v.optional(v.id("categories")),
        is_active: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_parent", ["parent_id"]),

    drinks: defineTable({
        name: v.string(),
        category: v.string(),
        subcategory: v.optional(v.string()),
        price: v.number(), // Price in cents
        inventory: v.number(), // Inventory count
        inventory_oz: v.number(), // Inventory in ounces
        unit_type: v.string(), // "bottle", "glass", "ounce", "shot", "can", "pint"
        unit_volume_oz: v.optional(v.number()),
        serving_size_oz: v.optional(v.number()),
        servings_per_container: v.optional(v.number()),
        cost_per_unit: v.optional(v.number()), // Cost in cents
        profit_margin: v.optional(v.number()),
        popularity_score: v.number(),
        tax_category_id: v.optional(v.id("tax_categories")),
        image_url: v.optional(v.string()),
        description: v.optional(v.string()),
        is_active: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_category", ["category"])
        .index("by_name", ["name"]),

    staff: defineTable({
        first_name: v.string(),
        last_name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        role: v.string(), // "bartender", "manager", "server", "admin"
        permissions: v.optional(v.any()), // JSON object
        hourly_rate: v.optional(v.number()), // Rate in cents
        hire_date: v.optional(v.string()), // Date string
        is_active: v.boolean(),
        pin_code: v.optional(v.string()),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_pin", ["pin_code"]),

    venues: defineTable({
        name: v.string(),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        zip_code: v.optional(v.string()),
        capacity: v.optional(v.number()),
        indoor_capacity: v.optional(v.number()),
        outdoor_capacity: v.optional(v.number()),
        amenities: v.optional(v.any()), // JSON array
        hourly_rate: v.optional(v.number()), // Rate in cents
        daily_rate: v.optional(v.number()), // Rate in cents
        setup_time_hours: v.number(),
        cleanup_time_hours: v.number(),
        description: v.optional(v.string()),
        is_active: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    }),

    event_packages: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        price_per_person: v.number(), // Price in cents
        min_guests: v.number(),
        max_guests: v.number(),
        duration_hours: v.number(),
        included_drinks: v.number(),
        bar_service_included: v.boolean(),
        setup_included: v.boolean(),
        cleanup_included: v.boolean(),
        catering_included: v.boolean(),
        package_items: v.optional(v.any()), // JSON array
        add_ons_available: v.optional(v.any()), // JSON array
        is_active: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    }),

    customers: defineTable({
        first_name: v.string(),
        last_name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zip_code: v.optional(v.string()),
        date_of_birth: v.optional(v.string()), // Date string
        preferences: v.optional(v.any()), // JSON object
        loyalty_points: v.number(),
        total_spent: v.number(), // In cents
        visit_count: v.number(),
        last_visit: v.optional(v.number()), // Timestamp
        notes: v.optional(v.string()),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_phone", ["phone"]),

    event_bookings: defineTable({
        customer_id: v.optional(v.id("customers")),
        venue_id: v.optional(v.id("venues")),
        package_id: v.optional(v.id("event_packages")),
        event_name: v.optional(v.string()),
        event_type: v.optional(v.string()),
        event_date: v.string(), // Date string
        start_time: v.optional(v.string()),
        end_time: v.optional(v.string()),
        guest_count: v.number(),
        base_price: v.optional(v.number()), // In cents
        add_ons_price: v.number(), // In cents
        total_price: v.optional(v.number()), // In cents
        deposit_paid: v.number(), // In cents
        balance_due: v.optional(v.number()), // In cents
        status: v.string(), // pending, confirmed, cancelled, completed
        special_requests: v.optional(v.string()),
        contract_signed: v.boolean(),
        payment_schedule: v.optional(v.any()), // JSON array
        assigned_staff: v.optional(v.any()), // JSON array
        setup_notes: v.optional(v.string()),
        notes: v.optional(v.string()),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_date", ["event_date"])
        .index("by_customer", ["customer_id"]),

    orders: defineTable({
        customer_id: v.optional(v.id("customers")),
        staff_id: v.optional(v.id("staff")),
        event_booking_id: v.optional(v.id("event_bookings")),
        session_id: v.optional(v.string()), // For voice sessions
        order_number: v.optional(v.string()),
        order_name: v.optional(v.string()), // For walk-ins/tabs
        items: v.any(), // JSON array of [{drink_id, quantity, price, name}]
        subtotal: v.number(), // Subtotal in cents
        tax_amount: v.number(), // Tax in cents
        total: v.number(), // Total in cents
        payment_method: v.optional(v.string()),
        payment_status: v.optional(v.string()), // pending, completed, failed, refunded
        status: v.string(), // pending, processing, completed, cancelled
        table_number: v.optional(v.string()),
        notes: v.optional(v.string()),
        discount_amount: v.number(), // Discount in cents
        tip_amount: v.number(), // Tip in cents
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_customer", ["customer_id"])
        .index("by_booking", ["event_booking_id"])
        .index("by_session", ["session_id"])
        .index("by_created", ["created_at"])
        .index("by_status_created", ["status", "created_at"]),

    transactions: defineTable({
        order_id: v.optional(v.id("orders")),
        booking_id: v.optional(v.id("event_bookings")),
        transaction_type: v.string(), // "sale", "refund", "deposit", "payment"
        amount: v.number(), // Amount in cents
        payment_method: v.string(),
        payment_processor: v.optional(v.string()),
        processor_transaction_id: v.optional(v.string()),
        payment_details: v.optional(v.any()), // JSON
        status: v.string(), // pending, completed, failed, cancelled
        refund_amount: v.number(), // Refund amount in cents
        fees: v.number(), // Processing fees in cents
        net_amount: v.optional(v.number()), // Amount after fees in cents
        processed_at: v.optional(v.number()),
        created_at: v.number(),
    })
        .index("by_order", ["order_id"])
        .index("by_booking", ["booking_id"]),

    inventory: defineTable({
        drink_id: v.id("drinks"),
        bottle_id: v.string(), // Unique bottle identifier
        size_oz: v.number(), // Total bottle size
        remaining_ml: v.string(), // Remaining volume as string
        cost: v.optional(v.number()), // Cost in cents
        vendor: v.optional(v.string()),
        batch_number: v.optional(v.string()),
        expiry_date: v.optional(v.string()),
        received_date: v.optional(v.string()),
        opened_at: v.optional(v.number()),
        finished_at: v.optional(v.number()),
        status: v.optional(v.string()), // unopened, opened, finished, expired, damaged
        location: v.optional(v.string()), // Bar section/shelf location
        reorder_level: v.number(), // Auto-reorder threshold
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_drink", ["drink_id"])
        .index("by_bottle_id", ["bottle_id"]),

    pours: defineTable({
        inventory_id: v.id("inventory"),
        order_id: v.optional(v.id("orders")),
        staff_id: v.optional(v.id("staff")),
        volume_ml: v.string(), // Volume as string
        volume_oz: v.optional(v.number()), // Volume in ounces
        cost_per_pour: v.optional(v.number()), // Cost in cents
        tax_amount: v.optional(v.string()), // Calculated tax for this pour as string
        compliance_verified: v.boolean(),
        created_at: v.number(),
    })
        .index("by_inventory", ["inventory_id"])
        .index("by_order", ["order_id"]),

    customer_tabs: defineTable({
        customer_id: v.optional(v.id("customers")),
        staff_id: v.optional(v.id("staff")),
        event_booking_id: v.optional(v.id("event_bookings")),
        tab_name: v.string(), // "Table 5", "Wedding Party", etc.
        current_total: v.number(), // Running total in cents
        items: v.optional(v.any()), // JSON array of tab items
        status: v.optional(v.string()), // open, closed, transferred
        opened_at: v.number(),
        closed_at: v.optional(v.number()),
        notes: v.optional(v.string()),
    })
        .index("by_status", ["status"])
        .index("by_customer", ["customer_id"]),

    analytics_data: defineTable({
        date: v.string(), // Date string
        metric_type: v.string(), // "sales", "inventory", "customer", "staff"
        metric_name: v.string(), // "daily_revenue", "top_seller", etc.
        value: v.string(), // JSON string for complex data
        metadata: v.optional(v.any()), // Additional context data
        created_at: v.number(),
    })
        .index("by_date", ["date"])
        .index("by_metric", ["metric_type", "metric_name"]),

    inventory_movements: defineTable({
        drink_id: v.optional(v.id("drinks")),
        inventory_id: v.optional(v.id("inventory")),
        staff_id: v.optional(v.id("staff")),
        movement_type: v.string(), // "purchase", "sale", "waste", "restock", "adjustment"
        quantity_change: v.number(), // Positive or negative
        cost_impact: v.optional(v.number()), // Cost impact in cents
        reason: v.optional(v.string()),
        reference_id: v.optional(v.number()), // Reference to order, booking, etc. (might need to be string or ID if linking to other tables)
        notes: v.optional(v.string()),
        created_at: v.number(),
    })
        .index("by_drink", ["drink_id"])
        .index("by_inventory", ["inventory_id"]),

    ai_insights: defineTable({
        insight_type: v.string(), // "sales_prediction", "inventory_optimization", "customer_behavior"
        title: v.string(),
        description: v.string(),
        confidence_score: v.optional(v.number()), // 0-1 confidence rating
        data_points: v.optional(v.any()), // Supporting data
        recommendations: v.optional(v.any()), // JSON array of recommended actions
        status: v.optional(v.string()), // active, implemented, dismissed
        priority: v.optional(v.string()), // low, medium, high, critical
        expires_at: v.optional(v.number()),
        created_at: v.number(),
    })
        .index("by_type", ["insight_type"])
        .index("by_status", ["status"]),

    system_config: defineTable({
        config_key: v.string(),
        config_value: v.string(),
        config_type: v.string(), // string, number, boolean, json
        description: v.optional(v.string()),
        is_sensitive: v.boolean(), // For API keys, etc.
        updated_by: v.optional(v.id("staff")),
        updated_at: v.number(),
    })
        .index("by_key", ["config_key"]),

    audit_log: defineTable({
        user_id: v.optional(v.id("staff")),
        user_type: v.optional(v.string()), // staff, customer, system, voice_assistant
        action: v.string(),
        table_name: v.optional(v.string()),
        record_id: v.optional(v.string()),
        old_values: v.optional(v.any()),
        new_values: v.optional(v.any()),
        ip_address: v.optional(v.string()),
        user_agent: v.optional(v.string()),
        session_id: v.optional(v.string()),
        created_at: v.number(),
    })
        .index("by_user", ["user_id"])
        .index("by_action", ["action"]),

    inventory_count_sessions: defineTable({
        location_name: v.string(),
        count_name: v.optional(v.string()),
        status: v.string(), // "in_progress", "completed"
        started_by: v.optional(v.id("staff")),
        started_at: v.number(),
        completed_at: v.optional(v.number()),
    })
        .index("by_status", ["status"]),

    inventory_count_items: defineTable({
        count_session_id: v.id("inventory_count_sessions"),
        drink_id: v.id("drinks"),
        quantity: v.number(),
        created_at: v.number(),
    })
        .index("by_session", ["count_session_id"]),

    inventory_adjustments: defineTable({
        drink_id: v.id("drinks"),
        location_name: v.string(),
        quantity: v.number(), // positive or negative
        adjustment_type: v.string(), // "spillage", "breakage", "comp", "theft", "expired"
        note: v.optional(v.string()),
        created_by: v.optional(v.id("staff")),
        created_at: v.number(),
        voided: v.boolean(),
        void_reason: v.optional(v.string()),
    })
        .index("by_drink", ["drink_id"])
        .index("by_created", ["created_at"]),

    event_allocations: defineTable({
        event_booking_id: v.id("event_bookings"),
        drink_id: v.id("drinks"),
        allocated_quantity: v.number(),
        consumed_quantity: v.number(),
        is_closed: v.boolean(),
        created_at: v.number(),
        updated_at: v.number(),
    })
        .index("by_event", ["event_booking_id"])
        .index("by_drink", ["drink_id"]),
});
