import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../../../.env");

dotenv.config({ path: rootEnvPath });

dotenv.config();

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5174")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const defaultDbFile = path.resolve(__dirname, "../../data/cestagarquins.sqlite3");
const dbFile = process.env.DB_FILE || defaultDbFile;

if (process.env.DB_CLIENT === "sqlite3" || !process.env.DB_CLIENT) {
    fs.mkdirSync(path.dirname(dbFile), { recursive: true });
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 4000),
    corsOrigins,
    sessionSecret: process.env.SESSION_SECRET || "change-me",
    dbClient: process.env.DB_CLIENT || "sqlite3",
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: Number(process.env.DB_PORT || 5432),
    dbUser: process.env.DB_USER || "postgres",
    dbPassword: process.env.DB_PASSWORD || "postgres",
    dbName: process.env.DB_NAME || "cestagarquins",
    dbFile
};
