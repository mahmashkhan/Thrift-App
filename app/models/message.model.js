// src/models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        is_read: {
            type: Boolean,
            default: false
        },
        is_filtered: {
            type: Boolean,
            default: false  // true if message was blocked/sanitized
        }
    },
    { timestamps: true }
);

// speeds up fetching messages of a conversation (most common query)
messageSchema.index({ conversation_id: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;