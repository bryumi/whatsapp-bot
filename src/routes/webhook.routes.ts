import { Router } from "express";
import { handleWebhook, verifyWebhook } from "../controllers/webhook.controller";

const router = Router();

router.get("/", verifyWebhook);
router.post("/", handleWebhook);

export default router;
