import { mutation } from "./_generated/server";
import { drinksData } from "./data/drinksData";

// Map drink names to image filenames
const getImageUrl = (drinkName: string): string => {
    const imageMap: Record<string, string> = {
        "Pineapple Smash": "/drink_images/pineapple_smash.png",
        "Cucumber Cooler": "/drink_images/cucumber_cooler.png",
        "Lavender Vodka": "/drink_images/lavender_vodka.png",
        "Old Fashioned": "/drink_images/old_fashioned.png",
        "Moscow Mule": "/drink_images/moscow_mule.png",
        "Espresso Martini": "/drink_images/espresso_martini.png",
        "Bud Light": "/drink_images/bud_light.png",
        "Coors Light": "/drink_images/coors_light.png",
        "Michelob Ultra": "/drink_images/michelob_ultra.png",
        "Miller Lite": "/drink_images/miller_lite.png",
        "Dos XX": "/drink_images/dos_xx.png",
        "Heineken": "/drink_images/heineken.png",
        "Shiner Bock": "/drink_images/shiner_bock.png",
        "Stella Artois": "/drink_images/stella_artois.png",
        "Corona Extra": "/drink_images/corona_extra.png",
        "Truly's Seltzer": "/drink_images/truly_s_seltzer.png",
        "White Claw": "/drink_images/white_claw.png",
        "Canyon Rd Cab": "/drink_images/canyon_rd_cab.png",
        "Daou Cab": "/drink_images/daou_cab.png",
        "Josh Wine": "/drink_images/josh_wine.png",
        "Moscato": "/drink_images/moscato.png",
        "Pinot G": "/drink_images/pinot_g.png",
        "St. Helena Chard": "/drink_images/st_helena_chard.png",
        "Sav Blanc": "/drink_images/sav_blanc.png",
        "March Prosecco": "/drink_images/march_prosecco.png",
        "Wycliff Champ": "/drink_images/wycliff_champ.png",
        "Angels Envy": "/drink_images/angels_envy.png",
        "Basil Hayden": "/drink_images/basil_hayden.png",
        "Crown Royal": "/drink_images/crown_royal.png",
        "JD's Whiskey": "/drink_images/jd_s_whiskey.png",
        "Jameson Whiskey": "/drink_images/jameson_whiskey.png",
        "Jim Beam": "/drink_images/jim_beam.png",
        "J.W. Black": "/drink_images/j_w_black.png",
        "Makers Mark": "/drink_images/makers_mark.png",
        "Woodford Reserve": "/drink_images/woodford_reserve.png",
        "Well Vodka": "/drink_images/well_vodka.png",
        "G.Goose Vodka": "/drink_images/g_goose_vodka.png",
        "Tito's Vodka": "/drink_images/tito_s_vodka.png",
        "Captain Morgan": "/drink_images/captain_morgan.png",
        "Cruzan Light": "/drink_images/cruzan_light.png",
        "Malibu": "/drink_images/malibu.png",
        "1800 Silver": "/drink_images/1800_silver.png",
        "Casamigos": "/drink_images/casamigos.png",
        "Don Julio": "/drink_images/don_julio.png",
        "Exotico Teq Blanco": "/drink_images/exotico_teq_blanco.png",
        "Patron Silver": "/drink_images/patron_silver.png",
        "Bombay Sapphire": "/drink_images/bombay_sapphire.png",
        "Hendricks Gin": "/drink_images/hendricks_gin.png",
        "New Amsterdam": "/drink_images/new_amsterdam.png",
        "Hennessy Cognac": "/drink_images/hennessy_cognac.png",
        "Glenlivet Reserve": "/drink_images/glenlivet_reserve.png",
        "Club Soda": "/drink_images/club_soda.png",
        "Coke": "/drink_images/coke.png",
        "Diet Coke": "/drink_images/diet_coke.png",
        "Ginger Ale": "/drink_images/ginger_ale.png",
        "Sprite": "/drink_images/sprite.png",
        "Tonic Water": "/drink_images/tonic_water.png",
        "Cranberry Juice": "/drink_images/cranberry_juice.png",
        "Orange Juice": "/drink_images/orange_juice.png",
        "Pineapple Juice": "/drink_images/pineapple_juice.png",
        "Blueberry Lemonade": "/drink_images/blueberry_lemonade.png",
        "Lav Lemonade": "/drink_images/lav_lemonade.png",
        "Sparkling Cider": "/drink_images/sparkling_cider.png",
        "The Honeymoon": "/drink_images/the_honeymoon.png"
    };

    return imageMap[drinkName] || "";
};

export const populateFromJSON = mutation({
    args: {},
    handler: async (ctx) => {
        // Clear existing drinks
        const existingDrinks = await ctx.db.query("drinks").collect();
        for (const drink of existingDrinks) {
            await ctx.db.delete(drink._id);
        }

        // Insert drinks from data
        for (const drink of drinksData) {
            await ctx.db.insert("drinks", {
                name: drink.name,
                category: drink.category,
                subcategory: drink.subcategory || "",
                price: drink.price * 100, // Convert to cents
                inventory: drink.inventory,
                inventory_oz: drink.inventory * 25.4, // Assume 25.4oz per bottle
                unit_type: "bottle",
                unit_volume_oz: 25.4,
                serving_size_oz: 1.5,
                servings_per_container: 16,
                popularity_score: 0,
                image_url: getImageUrl(drink.name),
                is_active: true,
                created_at: Date.now(),
                updated_at: Date.now(),
            });
        }

        return { success: true, count: drinksData.length };
    },
});
