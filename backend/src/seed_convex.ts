import { convex } from './lib/convex.js';
import { api } from '../convex/_generated/api.js';

async function seed() {
    console.log("🌱 Seeding Convex database with drinks...");

    // Check if we already have drinks
    const existing = await convex.query(api.drinks.searchDrinks, { query: "" });
    if (existing.length > 0) {
        console.log(`✅ Database already has ${existing.length} drinks. Skipping seed.`);
        return;
    }

    // Sample drinks data
    const drinks = [
        // Beers
        { name: 'Bud Light', category: 'beer', price: 550, inventory: 100, inventory_oz: 1200, description: 'Light American Lager' },
        { name: 'Heineken', category: 'beer', price: 600, inventory: 80, inventory_oz: 960, description: 'Premium Dutch Lager' },
        { name: 'IPA Draft', category: 'beer', price: 750, inventory: 50, inventory_oz: 600, description: 'Hoppy India Pale Ale' },
        { name: 'Guinness', category: 'beer', price: 800, inventory: 40, inventory_oz: 480, description: 'Irish Dry Stout' },
        { name: 'Corona Extra', category: 'beer', price: 650, inventory: 75, inventory_oz: 900, description: 'Mexican Pale Lager' },
        { name: 'Blue Moon', category: 'beer', price: 700, inventory: 60, inventory_oz: 720, description: 'Belgian-Style Wheat Ale' },

        // Wines
        { name: 'Cabernet Sauvignon', category: 'wine', price: 1200, inventory: 30, inventory_oz: 750, description: 'Full-bodied Red Wine' },
        { name: 'Chardonnay', category: 'wine', price: 1100, inventory: 35, inventory_oz: 875, description: 'Crisp White Wine' },
        { name: 'Prosecco', category: 'wine', price: 1000, inventory: 45, inventory_oz: 1125, description: 'Italian Sparkling Wine' },
        { name: 'Pinot Noir', category: 'wine', price: 1300, inventory: 25, inventory_oz: 625, description: 'Light-bodied Red Wine' },
        { name: 'Sauvignon Blanc', category: 'wine', price: 1050, inventory: 40, inventory_oz: 1000, description: 'Zesty White Wine' },
        { name: 'Merlot', category: 'wine', price: 1150, inventory: 28, inventory_oz: 700, description: 'Smooth Red Wine' },

        // Cocktails
        { name: 'Moscow Mule', category: 'cocktail', price: 1400, inventory: 60, inventory_oz: 480, description: 'Vodka, Ginger Beer, Lime' },
        { name: 'Margarita', category: 'cocktail', price: 1300, inventory: 55, inventory_oz: 440, description: 'Tequila, Triple Sec, Lime' },
        { name: 'Old Fashioned', category: 'cocktail', price: 1500, inventory: 40, inventory_oz: 320, description: 'Bourbon, Bitters, Sugar' },
        { name: 'Mojito', category: 'cocktail', price: 1350, inventory: 50, inventory_oz: 400, description: 'Rum, Mint, Lime, Soda' },
        { name: 'Cosmopolitan', category: 'cocktail', price: 1400, inventory: 45, inventory_oz: 360, description: 'Vodka, Cranberry, Lime' },
        { name: 'Manhattan', category: 'cocktail', price: 1450, inventory: 38, inventory_oz: 304, description: 'Whiskey, Vermouth, Bitters' },

        // Spirits
        { name: "Tito's Vodka", category: 'spirit', price: 900, inventory: 70, inventory_oz: 1680, description: 'Premium American Vodka' },
        { name: 'Hendricks Gin', category: 'spirit', price: 1000, inventory: 55, inventory_oz: 1320, description: 'Scottish Gin with Cucumber' },
        { name: 'Jameson Whiskey', category: 'spirit', price: 1100, inventory: 60, inventory_oz: 1440, description: 'Irish Whiskey' },
        { name: 'Patron Silver', category: 'spirit', price: 1200, inventory: 45, inventory_oz: 1080, description: 'Premium Tequila' },
        { name: 'Bacardi Rum', category: 'spirit', price: 850, inventory: 65, inventory_oz: 1560, description: 'White Rum' },
        { name: 'Jack Daniels', category: 'spirit', price: 1050, inventory: 58, inventory_oz: 1392, description: 'Tennessee Whiskey' },

        // Non-Alcoholic
        { name: 'Coca-Cola', category: 'non-alcoholic', price: 300, inventory: 120, inventory_oz: 1440, description: 'Classic Cola' },
        { name: 'Sprite', category: 'non-alcoholic', price: 300, inventory: 110, inventory_oz: 1320, description: 'Lemon-Lime Soda' },
        { name: 'Orange Juice', category: 'non-alcoholic', price: 400, inventory: 80, inventory_oz: 960, description: 'Fresh Squeezed OJ' },
        { name: 'Cranberry Juice', category: 'non-alcoholic', price: 400, inventory: 75, inventory_oz: 900, description: 'Pure Cranberry Juice' },
        { name: 'Sparkling Water', category: 'non-alcoholic', price: 250, inventory: 100, inventory_oz: 1200, description: 'Carbonated Water' },
        { name: 'Iced Tea', category: 'non-alcoholic', price: 350, inventory: 90, inventory_oz: 1080, description: 'Sweet Tea' },
    ];

    console.log(`Creating ${drinks.length} drinks...`);
    let created = 0;

    for (const drink of drinks) {
        try {
            await convex.mutation(api.drinks.createDrink, drink);
            created++;
            console.log(`✅ Created: ${drink.name}`);
        } catch (err) {
            console.error(`❌ Failed to create ${drink.name}:`, err);
        }
    }

    console.log(`\n🎉 Seeding complete! Created ${created}/${drinks.length} drinks.`);
}

seed()
    .then(() => {
        console.log("✨ Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    });
