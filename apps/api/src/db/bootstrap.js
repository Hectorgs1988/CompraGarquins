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

    const hasShoppingListItems = await db.schema.hasTable("shopping_list_items");
    if (!hasShoppingListItems) {
        await db.schema.createTable("shopping_list_items", (table) => {
            table.increments("id").primary();
            table.string("name").notNullable();
            table.integer("quantity").notNullable().defaultTo(1);
            table.string("source").notNullable().defaultTo("manual");
            table.integer("added_by_user_id").unsigned().nullable();
            table.timestamp("created_at").defaultTo(db.fn.now());
        });
    }

    const hasNfcTags = await db.schema.hasTable("nfc_tags");
    if (!hasNfcTags) {
        await db.schema.createTable("nfc_tags", (table) => {
            table.increments("id").primary();
            table.string("token").notNullable().unique();
            table.string("item_name").notNullable();
            table.integer("quantity").notNullable().defaultTo(1);
            table.boolean("is_active").notNullable().defaultTo(true);
            table.timestamp("last_used_at").nullable();
            table.timestamp("created_at").defaultTo(db.fn.now());
        });
    }

    const sampleToken = "f8f3a72d19c";
    const sampleTag = await db("nfc_tags").where({ token: sampleToken }).first();

    if (!sampleTag) {
        await db("nfc_tags").insert({
            token: sampleToken,
            item_name: "Leche",
            quantity: 1,
            is_active: true,
            created_at: db.fn.now()
        });
    }
}
