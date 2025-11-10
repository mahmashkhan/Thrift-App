const express = require('express');
const mongoose = require('mongoose');
const colors = require('colors')
const adminRoutes = require('./src/routes/authRoutes');
const cors = require('cors');

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors()); // Enable CORS for all routes


app.use(
  cors({
    origin: 'http://localhost:3001', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/yasmin-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'.yellow))
  .catch((err) => console.error('MongoDB connection error:'.red, err));


app.use('/api', adminRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`.blue));