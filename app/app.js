import express from 'express';
import userRoutes from './routes/user.routes.js';
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
app.use(userRoutes); 
app.use("/admin",adminRoutes); 


app.use(errorHandler);

export default app;