import app from "./app.js";
import dotenv from "dotenv";
import http from "http";
dotenv.config();
import connectDB from "./config/db.config.js";
import { initSocket } from "./socket/index.js";

const server = http.createServer(app);
initSocket(server);

connectDB();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));