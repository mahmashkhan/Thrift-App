import app from "./app.js";
import dotenv from "dotenv";
import { Server } from 'socket.io';
import http from "http";
dotenv.config();
import connectDB from "./config/db.config.js";



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

    socket.on("sendMessage", ({ to, message, from }) => {
        console.log("Ab Chalega Pakistaan", to, message, from )
        io.to(to).emit("receiveMessage", { message, from });
    });

    socket.on("disconnect", () => console.log("Socket disconnected"));
});

connectDB()

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
