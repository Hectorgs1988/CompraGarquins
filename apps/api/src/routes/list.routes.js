import { Router } from "express";
import { db } from "../db/knex.js";

const router = Router();

router.get("/", async (_req, res) => {
    const items = await db("shopping_list_items")
        .select("id", "name", "quantity", "source", "created_at")
        .orderBy("id", "desc");

    res.json({ items });
});

router.post("/", async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const quantity = Number(req.body?.quantity || 1);

    if (!name) {
        return res.status(400).json({ error: "name is required" });
    }

    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    const [itemId] = await db("shopping_list_items").insert({
        name,
        quantity: safeQuantity,
        source: "manual",
        added_by_user_id: req.session?.user?.id ?? null,
        created_at: db.fn.now()
    });

    const item = await db("shopping_list_items")
        .where({ id: Number(itemId) || itemId })
        .first();

    return res.status(201).json({ item });
});

export default router;
