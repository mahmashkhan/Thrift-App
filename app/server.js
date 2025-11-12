import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.config.js";


connectDB()

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
