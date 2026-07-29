import knex from "knex";
import { env } from "../config/env.js";

const connection = env.dbClient === "sqlite3"
    ? { filename: env.dbFile }
    : {
        host: env.dbHost,
        port: env.dbPort,
        user: env.dbUser,
        password: env.dbPassword,
        database: env.dbName
    };

export const db = knex({
    client: env.dbClient,
    connection,
    useNullAsDefault: env.dbClient === "sqlite3",
    pool: env.dbClient === "sqlite3" ? { min: 0, max: 1 } : { min: 0, max: 7 }
});
