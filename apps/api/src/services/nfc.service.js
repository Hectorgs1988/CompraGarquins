import { db } from "../db/knex.js";

function normalizeTag(row) {
    return {
        token: row.token,
        itemName: row.item_name,
        quantity: row.quantity,
        isActive: Boolean(row.is_active),
        lastUsedAt: row.last_used_at
    };
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
