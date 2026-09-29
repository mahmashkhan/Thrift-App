// src/routes/chat.routes.js
import express from "express";
import {
    startConversation,
    getConversations,
    getMessages,
    blockConversation,
    unblockConversation
} from "../controllers/chat.controller.js";
import { conversationValidator } from "../validators/chat.validator.js";
import { validate } from "../middleware/validate.params.js";
import { allowedUsers } from "../middleware/authorizationMiddleware.js";
// import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/start/conversations", validate(conversationValidator), allowedUsers(), startConversation);
router.get("/conversations", allowedUsers(), getConversations);
router.get("/conversations/:conversationId/messages", allowedUsers(), getMessages);
router.patch("/conversations/:conversationId/block", allowedUsers(), blockConversation);
router.patch("/conversations/:conversationId/unblock", allowedUsers(), unblockConversation);

export default router;