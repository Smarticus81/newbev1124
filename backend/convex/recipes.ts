export const UNIT_CONVERSIONS = {
    BOTTLE_OZ: 25.36, // Standard 750ml
    LITER_OZ: 33.81, // 1 Liter
    MAGNUM_OZ: 50.72, // 1.5 Liter
    SHOT_OZ: 1.5, // Standard shot
    GLASS_WINE_OZ: 6, // Standard wine pour
    CAN_OZ: 12, // Standard beer can
    PINT_OZ: 16, // Standard beer pint
};

export interface Recipe {
    ingredients: {
        name: string; // Matches drink name in DB (e.g. "Tito's Vodka")
        quantity: number; // In ounces or units
        unit: 'oz' | 'unit';
    }[];
}

// Map Sellable Item Name -> Recipe
export const DRINK_RECIPES: Record<string, Recipe> = {
    // --- Signature Cocktails ---
    "Pineapple Smash": {
        ingredients: [{ name: "Captain Morgan", quantity: 2, unit: 'oz' }]
    },
    "Cucumber Cooler": {
        ingredients: [{ name: "Hendricks Gin", quantity: 2, unit: 'oz' }]
    },
    "Lavender Vodka": {
        ingredients: [{ name: "Tito's Vodka", quantity: 2, unit: 'oz' }]
    },

    // --- Classics ---
    "Old Fashioned": {
        ingredients: [{ name: "Makers Mark", quantity: 2, unit: 'oz' }]
    },
    "Moscow Mule": {
        ingredients: [{ name: "Tito's Vodka", quantity: 1.5, unit: 'oz' }]
    },
    "Espresso Martini": {
        ingredients: [{ name: "Tito's Vodka", quantity: 1.5, unit: 'oz' }]
    },
    "Margarita": {
        ingredients: [{ name: "1800 Silver", quantity: 2, unit: 'oz' }]
    },
    "Mojito": {
        ingredients: [{ name: "Cruzan Light", quantity: 2, unit: 'oz' }]
    },

    // --- Spirits (Neat/Rocks/Mixer) ---
    // If sold as a "Spirit" item, assume a standard pour (1.5oz or 2oz)
    // We map the spirit name to itself with a standard pour
    "Tito's Vodka": { ingredients: [{ name: "Tito's Vodka", quantity: 1.5, unit: 'oz' }] },
    "Makers Mark": { ingredients: [{ name: "Makers Mark", quantity: 1.5, unit: 'oz' }] },
    "Hendricks Gin": { ingredients: [{ name: "Hendricks Gin", quantity: 1.5, unit: 'oz' }] },
    "Captain Morgan": { ingredients: [{ name: "Captain Morgan", quantity: 1.5, unit: 'oz' }] },
    "1800 Silver": { ingredients: [{ name: "1800 Silver", quantity: 1.5, unit: 'oz' }] },
    "Jameson Whiskey": { ingredients: [{ name: "Jameson Whiskey", quantity: 1.5, unit: 'oz' }] },
    "Jack Daniels": { ingredients: [{ name: "JD's Whiskey", quantity: 1.5, unit: 'oz' }] },
    "Crown Royal": { ingredients: [{ name: "Crown Royal", quantity: 1.5, unit: 'oz' }] },
    "Patron Silver": { ingredients: [{ name: "Patron Silver", quantity: 1.5, unit: 'oz' }] },
    "Don Julio": { ingredients: [{ name: "Don Julio", quantity: 1.5, unit: 'oz' }] },
    "Grey Goose": { ingredients: [{ name: "G.Goose Vodka", quantity: 1.5, unit: 'oz' }] },

    // --- Wines ---
    "Canyon Rd Cab": { ingredients: [{ name: "Canyon Rd Cab", quantity: 6, unit: 'oz' }] },
    "Daou Cab": { ingredients: [{ name: "Daou Cab", quantity: 6, unit: 'oz' }] },
    "Josh Wine": { ingredients: [{ name: "Josh Wine", quantity: 6, unit: 'oz' }] },
    "Moscato": { ingredients: [{ name: "Moscato", quantity: 6, unit: 'oz' }] },
    "Pinot G": { ingredients: [{ name: "Pinot G", quantity: 6, unit: 'oz' }] },
    "Sav Blanc": { ingredients: [{ name: "Sav Blanc", quantity: 6, unit: 'oz' }] },
    "March Prosecco": { ingredients: [{ name: "March Prosecco", quantity: 6, unit: 'oz' }] },

    // --- Beers ---
    "Bud Light": { ingredients: [{ name: "Bud Light", quantity: 1, unit: 'unit' }] },
    "Coors Light": { ingredients: [{ name: "Coors Light", quantity: 1, unit: 'unit' }] },
    "Michelob Ultra": { ingredients: [{ name: "Michelob Ultra", quantity: 1, unit: 'unit' }] },
    "Miller Lite": { ingredients: [{ name: "Miller Lite", quantity: 1, unit: 'unit' }] },
    "Dos XX": { ingredients: [{ name: "Dos XX", quantity: 1, unit: 'unit' }] },
    "Heineken": { ingredients: [{ name: "Heineken", quantity: 1, unit: 'unit' }] },
    "Shiner Bock": { ingredients: [{ name: "Shiner Bock", quantity: 1, unit: 'unit' }] },
    "Stella Artois": { ingredients: [{ name: "Stella Artois", quantity: 1, unit: 'unit' }] },
    "Corona Extra": { ingredients: [{ name: "Corona Extra", quantity: 1, unit: 'unit' }] },
    "Truly's Seltzer": { ingredients: [{ name: "Truly's Seltzer", quantity: 1, unit: 'unit' }] },
    "White Claw": { ingredients: [{ name: "White Claw", quantity: 1, unit: 'unit' }] },
};
