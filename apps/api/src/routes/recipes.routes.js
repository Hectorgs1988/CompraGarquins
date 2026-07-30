import { Router } from "express";

const router = Router();

const recipes = [
    {
        id: 1,
        title: "Tortilla de patatas",
        description: "Una receta clásica para cualquier día de la semana.",
        ingredients: ["patatas", "huevos", "cebolla", "aceite"],
        steps: [
            "Pela y corta las patatas y la cebolla.",
            "Fríe las patatas y la cebolla hasta que estén blandas.",
            "Bate los huevos y mézclalos con las verduras.",
            "Cocina la tortilla por ambos lados y sirve."
        ]
    },
    {
        id: 2,
        title: "Ensalada de pasta",
        description: "Fácil de preparar y muy práctica para llevar.",
        ingredients: ["pasta", "tomate", "atún", "aceitunas"],
        steps: [
            "Cuece la pasta y deja que se enfríe.",
            "Mezcla la pasta con el tomate, el atún y las aceitunas.",
            "Aliña con aceite y sirve fría."
        ]
    }
];

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

router.get("/", (_req, res) => {
    res.json({ recipes });
});

router.post("/", (req, res) => {
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

    const recipe = {
        id: Date.now(),
        title,
        description,
        ingredients,
        steps
    };

    recipes.unshift(recipe);

    return res.status(201).json({ recipe });
});

export default router;
