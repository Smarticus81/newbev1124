import { convex } from './lib/convex.js';
import { api } from '../convex/_generated/api.js';

async function checkData() {
    try {
        console.log("Checking drinks...");
        const drinks = await convex.query(api.drinks.searchDrinks, { query: "" });
        console.log(`Found ${drinks.length} drinks.`);
        if (drinks.length > 0) {
            console.log("First drink:", drinks[0]);
        } else {
            console.log("No drinks found. Database might need seeding.");
        }
    } catch (error) {
        console.error("Error querying Convex:", error);
    }
}

checkData();
