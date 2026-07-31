import { db } from "../db/knex.js";

function normalizeTag(row) {
    return {
        id: row.id,
        token: row.token,
        itemName: row.item_name,
        quantity: row.quantity,
        isActive: Boolean(row.is_active),
        lastUsedAt: row.last_used_at
    };
}

export async function listNfcTags() {
    const tags = await db("nfc_tags")
        .select("id", "token", "item_name", "quantity", "is_active", "last_used_at")
        .orderBy("id", "desc");

    return tags.map(normalizeTag);
}

export async function createNfcTag({ token, itemName, quantity, isActive = true }) {
    const [tagId] = await db("nfc_tags").insert({
        token,
        item_name: itemName,
        quantity,
        is_active: isActive,
        created_at: db.fn.now()
    });

    const tag = await db("nfc_tags")
        .where({ id: Number(tagId) || tagId })
        .first();

    return normalizeTag(tag);
}

export async function updateNfcTagById({ id, itemName, quantity, isActive }) {
    const updates = {};

    if (typeof itemName === "string" && itemName.trim()) {
        updates.item_name = itemName.trim();
    }

    if (Number.isFinite(quantity) && quantity > 0) {
        updates.quantity = quantity;
    }

    if (typeof isActive === "boolean") {
        updates.is_active = isActive;
    }

    if (!Object.keys(updates).length) {
        return null;
    }

    await db("nfc_tags").where({ id }).update(updates);

    const tag = await db("nfc_tags").where({ id }).first();

    if (!tag) {
        return null;
    }

    return normalizeTag(tag);
}

export async function getNfcTagByToken(token) {
    const tag = await db("nfc_tags").where({ token }).first();

    if (!tag) {
        return null;
    }

    return normalizeTag(tag);
}

export async function consumeNfcTag({ token, userId }) {
    const tag = await db("nfc_tags").where({ token }).first();

    if (!tag || !tag.is_active) {
        return null;
    }

    const [itemId] = await db("shopping_list_items").insert({
        name: tag.item_name,
        quantity: tag.quantity,
        status: "list",
        source: "nfc",
        added_by_user_id: userId,
        created_at: db.fn.now()
    });

    await db("nfc_tags")
        .where({ id: tag.id })
        .update({ last_used_at: db.fn.now() });

    const createdItem = await db("shopping_list_items")
        .where({ id: Number(itemId) || itemId })
        .first();

    return {
        tag: normalizeTag(tag),
        item: createdItem
    };
}
