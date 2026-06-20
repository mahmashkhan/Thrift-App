// src/controllers/chat.controller.js
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";

// ─── Start or get existing conversation ────────────────
export const startConversation = catchAsync(async (req, res, next) => {

    const { sellerId } = req.body;
    const buyer_id = req?.user?.id;

    if (sellerId === buyer_id) {
        return next(
            new AppError("Can't chat with ownself", 400)
        );
    }

    // console.log("---------------------", req?.user?.id)
    const participantIds = [sellerId.toString(), buyer_id.toString()].sort();
    const conversationKey = participantIds.join('_');

    // if conversation already exists, return it
    let conversation = await Conversation.findOne({
        participants: { $all: [buyer_id, sellerId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [buyer_id, sellerId],
            conversationKey
        });
    }

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(conversation)
    });
});

// ─── Get all conversations of logged in user ────────────────
export const getConversations = catchAsync(async (req, res) => {

    const userId = req.params.id;

    const conversations = await Conversation.find({
        participants: { $in: [userId] },
        isBlocked: false
    })
        .populate("participants", "name profile_image")
        // .populate("productId", "title images")
        .sort({ last_message_at: -1 });


    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(conversations)
    });

});

// ─── Get messages of a conversation ───────────────────────────────────────────
export const getMessages = catchAsync(async (req, res, next) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // make sure user is part of this conversation
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: { $in: [userId] }
    });

    if (!conversation) {
        return next(
            new AppError("No Conversation Found", 403)
        );
    }

    const messages = await Message.find({ conversation_id: conversationId })
        .sort({ createdAt: 1 });

    // mark all unread messages as read
    await Message.updateMany(
        { conversation_id: conversationId, sender_id: { $ne: userId }, is_read: false },
        { is_read: true }
    );

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(messages)
    });


});

// ─── Delete / block conversation ──────────────────────────────────────────────
export const blockConversation = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOneAndUpdate(
        {
            _id: conversationId,
            participants: { $in: [userId] }
        },
        { is_blocked: true, blocked_by: userId },
        { new: true }
    );

    if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Conversation blocked"
    });
});