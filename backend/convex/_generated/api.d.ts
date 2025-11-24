/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as cartMutations from "../cartMutations.js";
import type * as categories from "../categories.js";
import type * as data_drinksData from "../data/drinksData.js";
import type * as drinks from "../drinks.js";
import type * as eventAllocations from "../eventAllocations.js";
import type * as events from "../events.js";
import type * as inventoryAdjustments from "../inventoryAdjustments.js";
import type * as inventoryCounts from "../inventoryCounts.js";
import type * as orders from "../orders.js";
import type * as populateDrinks from "../populateDrinks.js";
import type * as products from "../products.js";
import type * as recipes from "../recipes.js";
import type * as voice from "../voice.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  cartMutations: typeof cartMutations;
  categories: typeof categories;
  "data/drinksData": typeof data_drinksData;
  drinks: typeof drinks;
  eventAllocations: typeof eventAllocations;
  events: typeof events;
  inventoryAdjustments: typeof inventoryAdjustments;
  inventoryCounts: typeof inventoryCounts;
  orders: typeof orders;
  populateDrinks: typeof populateDrinks;
  products: typeof products;
  recipes: typeof recipes;
  voice: typeof voice;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
