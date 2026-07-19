import app from "./app.js";
import dotenv from "dotenv";
import { Server } from 'socket.io';
import http from "http";
dotenv.config();
import connectDB from "./config/db.config.js";
import { containsBlockedContent } from "./middleware/chatFilter.middleware.js";
import Message from "./models/message.model.js";
import Conversation from "./models/conversation.model.js";



const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
})

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinRoom", (userId) => {
        socket.join(userId);
        console.log("Joined user room:", userId);
    });

    socket.on("sendMessage", async ({ to, from, message, conversation_id }) => {
        try {
            // 1. block if contains phone/email
            if (containsBlockedContent(message)) {
                socket.emit("messageBlocked", {
                    message: "Sharing contact info is not allowed"
                });
                return;
            }

            // 2. save to DB
            const newMessage = await Message.create({
                conversation_id,
                sender_id: from,
                text: message
            });

            // 3. update conversation last message
            await Conversation.findByIdAndUpdate(conversation_id, {
                lastMessage: message,
                lastMessageAt: new Date()
            });

            // 4. emit to recipient (already working in your code)
            io.to(to).emit("receiveMessage", {
                message,
                from,
                conversation_id,
                _id: newMessage._id,
                createdAt: newMessage.createdAt
            });

        } catch (error) {
            console.error("sendMessage error:", error.message);
        }
    });


    socket.on("disconnect", () => console.log("Socket disconnected"));
});

connectDB()

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
