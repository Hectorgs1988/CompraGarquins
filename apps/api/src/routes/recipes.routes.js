import { Router } from "express";
import { db } from "../db/knex.js";

const router = Router();

function selectRecipeColumns() {
    return ["id", "title", "description", "ingredients_json", "steps_json", "created_at"];
}

function parseJsonArray(value) {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map((entry) => String(entry || "").trim())
            .filter(Boolean);
    } catch {
        return [];
    }
}

function toRecipeResponse(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description || "",
        ingredients: parseJsonArray(row.ingredients_json),
        steps: parseJsonArray(row.steps_json)
    };
}

function normalizeIngredients(ingredients) {
    return String(ingredients || "")
        .split(/\n|,/)
        .map((ingredient) => ingredient.trim())
        .filter(Boolean);
}

function normalizeSteps(steps) {
    return String(steps || "")
        .split(/\n/)
        .map((step) => step.trim())
        .filter(Boolean);
}

router.get("/", async (_req, res) => {
    const rows = await db("recipes")
        .select(...selectRecipeColumns())
        .orderBy("id", "desc");

    const recipes = rows.map(toRecipeResponse);

    res.json({ recipes });
});

router.post("/", async (req, res) => {
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const ingredients = normalizeIngredients(req.body?.ingredients);
    const steps = normalizeSteps(req.body?.steps);

    if (!title) {
        return res.status(400).json({ error: "title is required" });
    }

    if (!ingredients.length) {
        return res.status(400).json({ error: "ingredients are required" });
    }

    const insertPayload = {
        title,
        description,
        ingredients_json: JSON.stringify(ingredients),
        steps_json: JSON.stringify(steps),
        created_at: db.fn.now()
    };

    const [recipeId] = await db("recipes").insert(insertPayload);

    const row = await db("recipes")
        .select(...selectRecipeColumns())
        .where({ id: Number(recipeId) || recipeId })
        .first();

    const recipe = toRecipeResponse(row);

    return res.status(201).json({ recipe });
});

router.put("/:id", async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const existingRecipe = await db("recipes")
        .select("id")
        .where({ id })
        .first();

    if (!existingRecipe) {
        return res.status(404).json({ error: "recipe not found" });
    }

    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const ingredients = normalizeIngredients(req.body?.ingredients);
    const steps = normalizeSteps(req.body?.steps);

    if (!title) {
        return res.status(400).json({ error: "title is required" });
    }

    if (!ingredients.length) {
        return res.status(400).json({ error: "ingredients are required" });
    }

    const updatePayload = {
        title,
        description,
        ingredients_json: JSON.stringify(ingredients),
        steps_json: JSON.stringify(steps)
    };

    await db("recipes")
        .where({ id })
        .update(updatePayload);

    const row = await db("recipes")
        .select(...selectRecipeColumns())
        .where({ id })
        .first();

    const recipe = toRecipeResponse(row);

    return res.json({ recipe });
});

router.delete("/:id", async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const existingRecipe = await db("recipes")
        .select("id")
        .where({ id })
        .first();

    if (!existingRecipe) {
        return res.status(404).json({ error: "recipe not found" });
    }

    await db("recipes")
        .where({ id })
        .del();

    return res.json({ ok: true, deletedRecipeId: id });
});

export default router;
