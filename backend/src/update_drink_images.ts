import { convex } from './lib/convex.js';
import { api } from '../convex/_generated/api.js';

async function updateDrinkImages() {
    console.log("🖼️  Updating drink images...");

    // Get all drinks
    const drinks = await convex.query(api.drinks.searchDrinks, { query: "" });
    console.log(`Found ${drinks.length} drinks to update`);

    // Map categories to image URLs
    const categoryImages: Record<string, string> = {
        'beer': '/images/drinks/beer.png',
        'wine': '/images/drinks/wine.png',
        'cocktail': '/images/drinks/cocktail.png',
        'spirit': '/images/drinks/spirit.png',
        'non-alcoholic': '/images/drinks/non-alcoholic.png',
    };

    let updated = 0;

    for (const drink of drinks) {
        try {
            const imageUrl = categoryImages[drink.category];

            if (imageUrl) {
                await convex.mutation(api.drinks.updateDrinkImage, {
                    drinkId: drink._id,
                    imageUrl: imageUrl,
                });
                console.log(`✅ Updated ${drink.name} with ${imageUrl}`);
                updated++;
            } else {
                console.log(`⚠️  No image found for category: ${drink.category}`);
            }
        } catch (err) {
            console.error(`❌ Failed to update ${drink.name}:`, err);
        }
    }

    console.log(`\n🎉 Updated ${updated}/${drinks.length} drinks with images!`);
}

updateDrinkImages()
    .then(() => {
        console.log("✨ Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error updating images:", error);
        process.exit(1);
    });
