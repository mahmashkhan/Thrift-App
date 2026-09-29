// src/controllers/chat.controller.js
import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";

// ─── Start or get existing conversation ────────────────
export const startConversation = catchAsync(async (req, res, next) => {
    const { participantId, contextType, contextId } = req.body;
    const currentUserId = req.user.id.toString();

    if (!participantId || !mongoose.isValidObjectId(participantId)) {
        return next(new AppError("A valid participantId is required", 400));
    }

    if (participantId.toString() === currentUserId) {
        return next(new AppError("Can't start a conversation with yourself", 400));
    }

    const participants = [currentUserId, participantId.toString()].sort();

    // one conversation per pair of users (and per context, if provided)
    let conversationKey = participants.join("_");
    if (contextType && contextId) {
        conversationKey += `_${contextType}_${contextId}`;
    }

    // atomic "find or create": safe even if two requests arrive at the same time
    const conversation = await Conversation.findOneAndUpdate(
        { conversationKey },
        {
            $setOnInsert: {
                participants,
                ...(contextType && contextId && {
                    context_type: contextType,
                    context_id: contextId,
                }),
            },
        },
        { new: true, upsert: true }
    );

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(conversation),
    });
});



// ─── Get all conversations of logged in user ────────────────
export const getConversations = catchAsync(async (req, res) => {
    const currentUserId = req.user.id.toString();

    const conversations = await Conversation.find({
        participants: currentUserId,
        blocked_by: { $ne: currentUserId }
    })
        .populate("participants", "name profile_image")
        .sort({ last_message_at: -1 });

    const data = conversations.map((c) => {
        const unread_count = c.unread_counts?.get(currentUserId) || 0;
        const obj = sanitizeResponse(c);
        delete obj.unread_counts; // don't leak other participants' counts
        return { ...obj, unread_count };
    });

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data,
    });
});
// ─── Get messages of a conversation ───────────────────────────────────────────
export const getMessages = catchAsync(async (req, res, next) => {
    const { conversationId } = req.params;
    const { before } = req.query;
    const currentUserId = req.user.id.toString();
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);

    if (!mongoose.isValidObjectId(conversationId)) {
        return next(new AppError("Invalid conversation id", 400));
    }
    if (before && !mongoose.isValidObjectId(before)) {
        return next(new AppError("Invalid 'before' cursor", 400));
    }

    // make sure the user is part of this conversation
    const conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, participants: currentUserId },
        { $set: { [`unread_counts.${currentUserId}`]: 0 } }
    );
    if (!conversation) {
        return next(new AppError("Conversation not found", 404));
    }

    const filter = { conversation_id: conversationId };
    if (before) filter._id = { $lt: before };

    // fetch one extra so we know whether older messages exist
    const results = await Message.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1);

    const hasMore = results.length > limit;
    const messages = (hasMore ? results.slice(0, limit) : results).reverse(); // oldest → newest

    // mark only the messages we are returning as read (and only the other person's)
    const unreadIds = messages
        .filter((m) => !m.is_read && m.sender_id.toString() !== currentUserId)
        .map((m) => m._id);

    if (unreadIds.length) {
        await Message.updateMany({ _id: { $in: unreadIds } }, { is_read: true });
    }

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(messages),
        pagination: {
            limit,
            hasMore,
            nextCursor: hasMore ? messages[0]._id : null,
        },
    });
});

// ─── Delete / block conversation ──────────────────────────────────────────────
export const blockConversation = catchAsync(async (req, res, next) => {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.isValidObjectId(conversationId)) {
        return next(new AppError("Invalid conversation id", 400));
    }

    const conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, participants: currentUserId },
        { $addToSet: { blocked_by: currentUserId } },
        { new: true }
    );

    if (!conversation) {
        return next(new AppError("Conversation not found", 404));
    }

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Conversation blocked",
    });
});

export const unblockConversation = catchAsync(async (req, res, next) => {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.isValidObjectId(conversationId)) {
        return next(new AppError("Invalid conversation id", 400));
    }

    const conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, participants: currentUserId },
        { $pull: { blocked_by: currentUserId } },
        { new: true }
    );

    if (!conversation) {
        return next(new AppError("Conversation not found", 404));
    }

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Conversation unblocked",
    });
});