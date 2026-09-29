import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { containsBlockedContent } from "../middleware/chatFilter.middleware.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;

let io;

// use this in other files (e.g. controllers) if they need to emit events
export const getIO = () => {
    if (!io) throw new Error("Socket.io is not initialized");
    return io;
};

// ─── Auth: runs once per connection, mirrors your allowedUsers middleware ───
const authenticateSocket = async (socket, next) => {
    try {
        const raw =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization;
        if (!raw) return next(new Error("Authentication required"));

        const token = raw.startsWith("Bearer ") ? raw.split(" ")[1] : raw;
        const decoded = jwt.verify(token, secret);
        if (!decoded?.id) return next(new Error("Invalid token"));

        const user = await User.findById(decoded.id).select("_id");
        if (!user) return next(new Error("User not found"));

        socket.user = user;
        next();
    } catch (err) {
        next(new Error("Invalid or expired token"));
    }
};

// ─── Chat events ───
const registerChatHandlers = (socket) => {
    const currentUserId = socket.user.id;

    socket.on("sendMessage", async ({ message, conversation_id } = {}) => {
        const from = currentUserId; // from the token, never from the client


        console.log("FROM BE LIKE ", from)
        try {
            // 1. validate input
            const text = typeof message === "string" ? message.trim() : "";
            if (!text) {
                return socket.emit("messageError", { message: "Message can't be empty" });
            }
            if (text.length > 2000) {
                return socket.emit("messageError", { message: "Message is too long" });
            }
            if (!mongoose.isValidObjectId(conversation_id)) {
                return socket.emit("messageError", { message: "Invalid conversation" });
            }

            // 2. the sender must be a participant of this conversation
            const conversation = await Conversation.findOne({
                _id: conversation_id,
                participants: from,
            });
            if (!conversation) {
                return socket.emit("messageError", { message: "Conversation not found" });
            }

            // 3. blocked chats can't receive messages
            if (conversation.blocked_by?.length) {
                return socket.emit("messageError", {
                    message: "You can't send messages in this conversation",
                });
            }

            // 4. block if contains phone/email
            if (containsBlockedContent(text)) {
                return socket.emit("messageBlocked", {
                    message: "Sharing contact info is not allowed",
                });
            }

            // 5. save to DB
            const newMessage = await Message.create({
                conversation_id,
                sender_id: from,
                text,
            });

            // 6. recipients = everyone in the conversation except the sender
            const recipientIds = conversation.participants
                .map((id) => id.toString())
                .filter((id) => id !== from);

            // 7. update conversation: last message + bump unread count for each recipient
            const incFields = {};
            recipientIds.forEach((id) => {
                incFields[`unread_counts.${id}`] = 1;
            });

            await Conversation.findByIdAndUpdate(conversation_id, {
                $set: {
                    last_message: text.slice(0, 100),
                    last_message_at: newMessage.createdAt,
                },
                $inc: incFields,
            });

            // 8. deliver to recipients
            recipientIds.forEach((recipientId) => {
                io.to(recipientId).emit("receiveMessage", {
                    message: text,
                    from,
                    conversation_id,
                    _id: newMessage._id,
                    createdAt: newMessage.createdAt,
                });
            });
        } catch (error) {
            console.error("sendMessage error:", error.message);
            socket.emit("messageError", { message: "Something went wrong" });
        }
    });
};

// ─── Init: called once from server.js ───
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    io.use(authenticateSocket);

    io.on("connection", (socket) => {
        const currentUserId = socket.user.id;

        // every user automatically joins their own room
        socket.join(currentUserId);
        console.log("Socket connected:", socket.id, "user:", currentUserId);

        registerChatHandlers(socket);

        socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
    });

    return io;
};