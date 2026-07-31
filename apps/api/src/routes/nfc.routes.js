import { Router } from "express";
import {
	consumeTag,
	createTag,
	getNfcTag,
	getNfcTags,
	updateTag
} from "../controllers/nfc.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

const router = Router();

router.get("/tags", requireAuth, getNfcTags);
router.post("/tags", requireAuth, createTag);
router.patch("/tags/:id", requireAuth, updateTag);

router.get("/:token", getNfcTag);
router.post("/:token/consume", requireAuth, consumeTag);

export default router;
