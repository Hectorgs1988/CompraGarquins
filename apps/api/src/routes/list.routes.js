import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ items: [], note: "pending real implementation" });
});

export default router;
