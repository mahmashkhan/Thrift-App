import express from 'express';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from "./routes/order.routes.js"
import googleRoutes from './routes/google.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cors from 'cors';
import passport from 'passport';
import './config/google.strategy.js';
import errorHandler from './middleware/error.handler.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());


app.use(googleRoutes);
app.use('/api/v1/user', userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);


app.use(errorHandler);

export default app;