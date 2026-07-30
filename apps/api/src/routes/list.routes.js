import { Router } from "express";
import { db } from "../db/knex.js";

const router = Router();

function selectListColumns() {
    return ["id", "name", "quantity", "status", "source", "created_at"];
}

router.get("/", async (_req, res) => {
    const items = await db("shopping_list_items")
        .select(...selectListColumns())
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
        status: "list",
        source: "manual",
        added_by_user_id: req.session?.user?.id ?? null,
        created_at: db.fn.now()
    });

    const item = await db("shopping_list_items")
        .select(...selectListColumns())
        .where({ id: Number(itemId) || itemId })
        .first();

    return res.status(201).json({ item });
});

router.patch("/:id", async (req, res) => {
    const itemId = Number(req.params.id);
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : undefined;
    const quantity = Number(req.body?.quantity);

    const existingItem = await db("shopping_list_items").where({ id: itemId }).first();

    if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
    }

    if (existingItem.status !== "list") {
        return res.status(409).json({ error: "Only list items can be edited" });
    }

    const updates = {};

    if (name) {
        updates.name = name;
    }

    if (Number.isFinite(quantity) && quantity > 0) {
        updates.quantity = quantity;
    }

    if (!Object.keys(updates).length) {
        return res.status(400).json({ error: "Nothing to update" });
    }

    await db("shopping_list_items").where({ id: itemId }).update(updates);

    const item = await db("shopping_list_items")
        .select(...selectListColumns())
        .where({ id: itemId })
        .first();

    return res.json({ item });
});

router.delete("/:id", async (req, res) => {
    const itemId = Number(req.params.id);
    const existingItem = await db("shopping_list_items").where({ id: itemId }).first();

    if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
    }

    if (existingItem.status !== "list") {
        return res.status(409).json({ error: "Only list items can be deleted" });
    }

    await db("shopping_list_items").where({ id: itemId }).del();

    return res.json({ ok: true, deletedItemId: itemId });
});

router.post("/:id/cart", async (req, res) => {
    const itemId = Number(req.params.id);
    const existingItem = await db("shopping_list_items").where({ id: itemId }).first();

    if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
    }

    await db("shopping_list_items").where({ id: itemId }).update({ status: "basket" });

    const item = await db("shopping_list_items")
        .select(...selectListColumns())
        .where({ id: itemId })
        .first();

    return res.json({ item });
});

router.post("/:id/restore", async (req, res) => {
    const itemId = Number(req.params.id);
    const existingItem = await db("shopping_list_items").where({ id: itemId }).first();

    if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
    }

    await db("shopping_list_items").where({ id: itemId }).update({ status: "list" });

    const item = await db("shopping_list_items")
        .select(...selectListColumns())
        .where({ id: itemId })
        .first();

    return res.json({ item });
});

router.post("/finalize", async (_req, res) => {
    const deletedCount = await db("shopping_list_items")
        .where({ status: "basket" })
        .del();

    return res.json({ ok: true, deletedCount });
});

export default router;
