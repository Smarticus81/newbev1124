import { convex } from './lib/convex.js';
import { api } from '../convex/_generated/api.js';
import fs from 'fs';
import path from 'path';

async function seed() {
    console.log("Seeding database...");

    // Read drinks.json
    const drinksPath = path.join(process.cwd(), '../../drinks.json');
    let drinksData = [];
    try {
        const fileContent = fs.readFileSync(drinksPath, 'utf-8');
        drinksData = JSON.parse(fileContent);
        console.log(`Loaded ${drinksData.length} drinks from drinks.json`);
    } catch (error) {
        console.error("Error reading drinks.json:", error);
        return;
    }

    // First check if we have data
    const existing = await convex.query(api.drinks.searchDrinks, { query: "" });
    if (existing.length > 0) {
        console.log("Database already has data. Skipping seed.");
        return;
    }

    for (const drink of drinksData) {
        try {
            // Map JSON fields to Convex schema
            // JSON: { category_id, name, category, subcategory, price, inventory, sales? }
            // Schema: { name, category, price, description?, inventory, inventory_oz, image_url? }

            const newDrink = {
                name: drink.name,
                category: drink.category.toLowerCase(),
                price: drink.price * 100, // Convert to cents if price is in dollars, assuming JSON is dollars
                description: `${drink.subcategory} ${drink.category}`,
                inventory: drink.inventory,
                inventory_oz: drink.inventory * 12, // Estimate 12oz per unit if not specified
                image_url: undefined, // No image in JSON
            };

            await convex.mutation(api.drinks.createDrink, newDrink);
            console.log(`Created ${drink.name}`);
        } catch (err) {
            console.error(`Failed to create ${drink.name}:`, err);
        }
    }
    console.log("Seeding complete!");
}

seed();
