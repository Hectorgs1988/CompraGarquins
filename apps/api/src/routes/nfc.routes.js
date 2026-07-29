import { Router } from "express";

const router = Router();

router.get("/:slug", (req, res) => {
    const { slug } = req.params;
    res.json({ slug, action: "resolve NFC slug to item in future" });
});

export default router;
