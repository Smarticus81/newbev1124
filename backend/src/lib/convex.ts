import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config();

const convexUrl = process.env.CONVEX_URL;

if (!convexUrl) {
    throw new Error("CONVEX_URL is not defined in environment variables");
}

export const convex = new ConvexHttpClient(convexUrl);
