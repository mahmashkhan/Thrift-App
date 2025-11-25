import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// const { MONGODB_URI } = process.env;


const USERNAME = "mahmashak08";   //Import from ENV
const PASSWORD = "yasmin-app786"; //Import from ENV
const MONGODB_URI = `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.zics7mf.mongodb.net/?appName=Cluster0"` // Replace with env 


const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
            .then(() => {
                console.log('MongoDB connected successfully');
            })
            .catch((err) => {
                console.error('MongoDB connection error:', err.message);
                process.exit(1);
            })
    } catch (error) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

export default connectDB;