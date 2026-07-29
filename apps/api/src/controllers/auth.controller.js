import { db } from "../db/knex.js";

export async function login(req, res) {
    const { email, name } = req.body;

    if (!email || !name) {
        return res.status(400).json({ error: "email and name are required" });
    }

    let user = await db("users").where({ email }).first();

    if (!user) {
        await db("users").insert({ email, name });
        user = await db("users").where({ email }).first();
    }

    req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    return res.json({ user: req.session.user });
}

export function me(req, res) {
    return res.json({ user: req.session.user || null });
}

export function logout(req, res) {
    req.session.destroy(() => {
        res.clearCookie("cesta.sid");
        res.status(204).send();
    });
}
