import { consumeNfcTag, getNfcTagByToken } from "../services/nfc.service.js";

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
