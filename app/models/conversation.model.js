// src/models/conversation.model.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: false
        },

        blocked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        last_message: { type: String, default: null },
        last_message_at: { type: Date, default: null },
        unread_counts: { type: Map, of: Number, default: {} },
        conversationKey: { type: String, required: true, unique: true },
        context_type: { type: String, default: null },
        context_id: { type: String, default: null }
    },
    { timestamps: true }
);

// so same two users can't have duplicate conversation on same product
// conversationSchema.index(
//     { conversationKey: 1 },
//     { unique: true }
// );

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;