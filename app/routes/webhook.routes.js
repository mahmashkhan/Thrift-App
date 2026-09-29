import express from "express";
import { handleStripeWebhook } from "../controllers/webhook.controller.js";
import { handleQuiqupWebhook } from "../controllers/courier.controller.js";

const router = express.Router();

router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);
router.post("/quiqup", express.raw({ type: "application/json" }), handleQuiqupWebhook);

export default router;