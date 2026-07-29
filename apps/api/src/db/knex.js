import knex from "knex";
import { env } from "../config/env.js";

const connection = {
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName
};

export const db = knex({
  client: env.dbClient,
  connection,
  pool: { min: 0, max: 7 }
});
