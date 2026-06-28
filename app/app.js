import express from 'express';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from "./routes/order.routes.js"
import googleRoutes from './routes/google.routes.js';
import './config/facebook.strategy.js';
import './config/apple.strategy.js';
import facebookRoutes from './routes/facebook.routes.js';
import appleRoutes from './routes/apple.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cors from 'cors';
import passport from 'passport';
import './config/google.strategy.js';
import errorHandler from './middleware/error.handler.js';
import chatRoutes from "./routes/chat.routes.js";
import favouriteRoutes from "./routes/favourites.routes.js";
import notificationRoutes from "./routes/notifications.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());


app.use(googleRoutes);
app.use(facebookRoutes);
app.use(appleRoutes);
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Application is healthy"
    });
});




app.use('/api/v1/user', userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/favourite", favouriteRoutes);
app.use("/api/v1/notifications", notificationRoutes);


app.use(errorHandler);

export default app;