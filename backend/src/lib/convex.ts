import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

dotenv.config();

const FALLBACK_CONVEX_URL = "https://impartial-orca-713.convex.cloud";

const convexUrlFromEnv =
    process.env.CONVEX_URL ||
    process.env.PUBLIC_CONVEX_URL ||
    process.env.VITE_CONVEX_URL;

const convexUrl = convexUrlFromEnv || FALLBACK_CONVEX_URL;

if (!convexUrl) {
    throw new Error("Convex URL is required to initialize the data layer");
}

if (!convexUrlFromEnv) {
    logger.warn(
        { fallbackUrl: FALLBACK_CONVEX_URL },
        "CONVEX_URL missing, falling back to baked-in deployment URL"
    );
    process.env.CONVEX_URL = convexUrl;
}

export const convex = new ConvexHttpClient(convexUrl);
