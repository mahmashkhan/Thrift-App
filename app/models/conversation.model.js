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
        lastMessage: {
            type: String,
            default: ""
        },
        lastMessageAt: {
            type: Date,
            default: null
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        blockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        conversationKey: {
            type: String,
            unique: true
        }
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