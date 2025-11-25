import app from "./app.js";
import dotenv from "dotenv";
import { Server } from 'socket.io';
import http from "http";
dotenv.config();
import connectDB from "./config/db.config.js";



const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {
    console.log("socket connect", socket.id);
})

connectDB()

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
