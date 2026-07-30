import { db } from "../db/knex.js";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 20;
const loginAttemptsByIp = new Map();

function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];

    if (typeof forwarded === "string" && forwarded.trim()) {
        return forwarded.split(",")[0].trim();
    }

    return req.ip || req.socket?.remoteAddress || "unknown";
}

function canAttemptLogin(ip) {
    const entry = loginAttemptsByIp.get(ip);
    const now = Date.now();

    if (!entry) {
        return true;
    }

    if (now - entry.windowStart > LOGIN_WINDOW_MS) {
        loginAttemptsByIp.delete(ip);
        return true;
    }

    return entry.count < LOGIN_MAX_ATTEMPTS;
}

function registerFailedAttempt(ip) {
    const now = Date.now();
    const entry = loginAttemptsByIp.get(ip);

    if (!entry || now - entry.windowStart > LOGIN_WINDOW_MS) {
        loginAttemptsByIp.set(ip, { count: 1, windowStart: now });
        return;
    }

    entry.count += 1;
    loginAttemptsByIp.set(ip, entry);
}

function clearAttempts(ip) {
    loginAttemptsByIp.delete(ip);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function login(req, res) {
    const ip = getClientIp(req);

    if (!canAttemptLogin(ip)) {
        return res.status(429).json({ error: "Too many login attempts. Please try again later." });
    }

    const email = String(req.body?.email || "").trim().toLowerCase();
    const name = String(req.body?.name || "").trim();

    if (!email || !name) {
        registerFailedAttempt(ip);
        return res.status(400).json({ error: "email and name are required" });
    }

    if (!isValidEmail(email)) {
        registerFailedAttempt(ip);
        return res.status(400).json({ error: "invalid email" });
    }

    if (name.length < 2 || name.length > 80) {
        registerFailedAttempt(ip);
        return res.status(400).json({ error: "name must be between 2 and 80 characters" });
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

    clearAttempts(ip);

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
