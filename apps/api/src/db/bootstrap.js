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
            table.string("status").notNullable().defaultTo("list");
            table.string("source").notNullable().defaultTo("manual");
            table.string("recipe_group").nullable();
            table.integer("added_by_user_id").unsigned().nullable();
            table.timestamp("created_at").defaultTo(db.fn.now());
        });
    } else {
        const hasStatusColumn = await db.schema.hasColumn("shopping_list_items", "status");
        if (!hasStatusColumn) {
            await db.schema.alterTable("shopping_list_items", (table) => {
                table.string("status").notNullable().defaultTo("list");
            });

            await db("shopping_list_items")
                .whereNull("status")
                .update({ status: "list" });
        }

        const hasRecipeGroupColumn = await db.schema.hasColumn("shopping_list_items", "recipe_group");
        if (!hasRecipeGroupColumn) {
            await db.schema.alterTable("shopping_list_items", (table) => {
                table.string("recipe_group").nullable();
            });
        }
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

    const hasRecipes = await db.schema.hasTable("recipes");
    if (!hasRecipes) {
        await db.schema.createTable("recipes", (table) => {
            table.increments("id").primary();
            table.string("title").notNullable();
            table.text("description").notNullable().defaultTo("");
            table.text("ingredients_json").notNullable();
            table.text("steps_json").notNullable();
            table.timestamp("created_at").defaultTo(db.fn.now());
        });
    } else {
        const hasDescriptionColumn = await db.schema.hasColumn("recipes", "description");
        if (!hasDescriptionColumn) {
            await db.schema.alterTable("recipes", (table) => {
                table.text("description").notNullable().defaultTo("");
            });
        }

        const hasIngredientsJsonColumn = await db.schema.hasColumn("recipes", "ingredients_json");
        if (!hasIngredientsJsonColumn) {
            await db.schema.alterTable("recipes", (table) => {
                table.text("ingredients_json").notNullable().defaultTo("[]");
            });
        }

        const hasStepsJsonColumn = await db.schema.hasColumn("recipes", "steps_json");
        if (!hasStepsJsonColumn) {
            await db.schema.alterTable("recipes", (table) => {
                table.text("steps_json").notNullable().defaultTo("[]");
            });
        }
    }

    const existingRecipes = await db("recipes").count({ total: "id" }).first();
    const recipesCount = Number(existingRecipes?.total || 0);

    if (recipesCount === 0) {
        await db("recipes").insert([
            {
                title: "Tortilla de patatas",
                description: "Una receta clásica para cualquier día de la semana.",
                ingredients_json: JSON.stringify(["patatas", "huevos", "cebolla", "aceite"]),
                steps_json: JSON.stringify([
                    "Pela y corta las patatas y la cebolla.",
                    "Fríe las patatas y la cebolla hasta que estén blandas.",
                    "Bate los huevos y mézclalos con las verduras.",
                    "Cocina la tortilla por ambos lados y sirve."
                ]),
                created_at: db.fn.now()
            },
            {
                title: "Ensalada de pasta",
                description: "Fácil de preparar y muy práctica para llevar.",
                ingredients_json: JSON.stringify(["pasta", "tomate", "atún", "aceitunas"]),
                steps_json: JSON.stringify([
                    "Cuece la pasta y deja que se enfríe.",
                    "Mezcla la pasta con el tomate, el atún y las aceitunas.",
                    "Aliña con aceite y sirve fría."
                ]),
                created_at: db.fn.now()
            }
        ]);
    }
}
