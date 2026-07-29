import { Router } from "express";
import { consumeTag, getNfcTag } from "../controllers/nfc.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = Router();

router.get("/:token", getNfcTag);
router.post("/:token/consume", requireAuth, consumeTag);

export default router;
