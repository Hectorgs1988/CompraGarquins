import { Router } from "express";
import { db } from "../db/knex.js";

const router = Router();

router.get("/", async (_req, res) => {
    const items = await db("shopping_list_items")
        .select("id", "name", "quantity", "source", "created_at")
        .orderBy("id", "desc");

    res.json({ items });
});

export default router;
