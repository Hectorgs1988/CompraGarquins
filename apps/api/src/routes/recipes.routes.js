import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ recipes: [], note: "pending real implementation" });
});

export default router;
