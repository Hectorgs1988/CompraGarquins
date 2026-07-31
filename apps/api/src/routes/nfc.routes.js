import { Router } from "express";
import {
	consumeTag,
	createTag,
	deleteTag,
	getNfcTag,
	getNfcTags,
	updateTag
} from "../controllers/nfc.controller.js";

const router = Router();

router.get("/tags", getNfcTags);
router.post("/tags", createTag);
router.patch("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

router.get("/:token", getNfcTag);
router.post("/:token/consume", consumeTag);

export default router;
