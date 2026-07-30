import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../../../.env");

dotenv.config({ path: rootEnvPath });

dotenv.config();

function parseBoolean(value, fallback = false) {
    if (value === undefined) {
        return fallback;
    }

    return String(value).trim().toLowerCase() === "true";
}

function parseSameSite(value, fallback) {
    const allowedValues = ["lax", "strict", "none"];
    const normalized = String(value || "").trim().toLowerCase();

    if (allowedValues.includes(normalized)) {
        return normalized;
    }

    return fallback;
}

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5174")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const defaultDbFile = path.resolve(__dirname, "../../data/cestagarquins.sqlite3");
const dbFile = process.env.DB_FILE || defaultDbFile;
const isProduction = (process.env.NODE_ENV || "development") === "production";
const sessionCookieSameSite = parseSameSite(
    process.env.SESSION_COOKIE_SAME_SITE,
    isProduction ? "none" : "lax"
);
const sessionCookieSecure = sessionCookieSameSite === "none"
    ? true
    : parseBoolean(process.env.SESSION_COOKIE_SECURE, isProduction);

if (process.env.DB_CLIENT === "sqlite3" || !process.env.DB_CLIENT) {
    fs.mkdirSync(path.dirname(dbFile), { recursive: true });
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 4000),
    corsOrigins,
    sessionSecret: process.env.SESSION_SECRET || "change-me",
    sessionCookieSameSite,
    sessionCookieSecure,
    sessionCookieDomain: process.env.SESSION_COOKIE_DOMAIN || undefined,
    trustProxy: parseBoolean(process.env.TRUST_PROXY, isProduction),
    trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || 1),
    dbClient: process.env.DB_CLIENT || "sqlite3",
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: Number(process.env.DB_PORT || 5432),
    dbUser: process.env.DB_USER || "postgres",
    dbPassword: process.env.DB_PASSWORD || "postgres",
    dbName: process.env.DB_NAME || "cestagarquins",
    dbFile
};
