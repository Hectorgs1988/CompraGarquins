import {
    consumeNfcTag,
    createNfcTag,
    getNfcTagByToken,
    listNfcTags,
    updateNfcTagById
} from "../services/nfc.service.js";

function parseQuantity(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseIsActive(value) {
    if (typeof value === "boolean") {
        return value;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return undefined;
}

export async function getNfcTags(_req, res) {
    const tags = await listNfcTags();
    return res.json({ tags });
}

export async function createTag(req, res) {
    const token = String(req.body?.token || "").trim();
    const itemName = String(req.body?.itemName || "").trim();
    const quantity = parseQuantity(req.body?.quantity);
    const isActive = parseIsActive(req.body?.isActive);

    if (!token || !itemName || !quantity) {
        return res.status(400).json({ error: "token, itemName and quantity are required" });
    }

    try {
        const tag = await createNfcTag({ token, itemName, quantity, isActive: isActive ?? true });
        return res.status(201).json({ tag });
    } catch (error) {
        if (error?.code === "SQLITE_CONSTRAINT" || error?.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Token already exists" });
        }

        throw error;
    }
}

export async function updateTag(req, res) {
    const id = Number(req.params.id);
    const itemName = typeof req.body?.itemName === "string" ? req.body.itemName : undefined;
    const quantity = req.body?.quantity === undefined ? undefined : parseQuantity(req.body.quantity);
    const isActive = parseIsActive(req.body?.isActive);

    if (!Number.isFinite(id)) {
        return res.status(400).json({ error: "Invalid tag id" });
    }

    if (req.body?.quantity !== undefined && quantity === null) {
        return res.status(400).json({ error: "quantity must be greater than 0" });
    }

    const tag = await updateNfcTagById({ id, itemName, quantity, isActive });

    if (!tag) {
        return res.status(404).json({ error: "Tag not found or nothing to update" });
    }

    return res.json({ tag });
}

export async function getNfcTag(req, res) {
    const { token } = req.params;
    const tag = await getNfcTagByToken(token);

    if (!tag) {
        return res.status(404).json({ error: "NFC tag not found" });
    }

    return res.json({ tag });
}

export async function consumeTag(req, res) {
    const { token } = req.params;
    const userId = req.session.user.id;
    const result = await consumeNfcTag({ token, userId });

    if (!result) {
        return res.status(404).json({ error: "NFC tag not found or inactive" });
    }

    return res.status(201).json({
        ok: true,
        consumedAt: new Date().toISOString(),
        tag: result.tag,
        item: result.item
    });
}
