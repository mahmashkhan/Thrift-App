// src/routes/chat.routes.js
import express from "express";
import {
    startConversation,
    getConversations,
    getMessages,
    blockConversation
} from "../controllers/chat.controller.js";
import { conversationValidator } from "../validators/chat.validator.js";
import { validate } from "../middleware/validate.params.js";
import { allowedUsers } from "../middleware/authorizationMiddleware.js";
// import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/start/conversations", validate(conversationValidator), allowedUsers(), startConversation);
router.get("/conversations/:id", allowedUsers(), getConversations);
router.get("/conversations/:conversationId/messages", allowedUsers(), getMessages);
router.patch("/conversations/:conversationId/block", allowedUsers(), blockConversation);

export default router;