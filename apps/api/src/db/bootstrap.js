import { db } from "./knex.js";

export async function bootstrapDb() {
    const hasSessions = await db.schema.hasTable("sessions");
    if (!hasSessions) {
        await db.schema.createTable("sessions", (table) => {
            table.string("sid").primary();
            table.text("sess").notNullable();
            table.timestamp("expired").notNullable().index();
        });
    }

    const hasUsers = await db.schema.hasTable("users");
    if (!hasUsers) {
        await db.schema.createTable("users", (table) => {
            table.increments("id").primary();
            table.string("email").notNullable().unique();
            table.string("name").notNullable();
            table.timestamp("created_at").defaultTo(db.fn.now());
        });
    }
}
