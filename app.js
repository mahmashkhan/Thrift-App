const express = require('express');
const mongoose = require('mongoose');
const colors = require('colors')
const adminRoutes = require('./src/routes/authRoutes');
const cors = require('cors');
const session = require('express-session')
const passport = require("passport")
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
require("./src/controllers/googleStartegy")
const user= process.env.DB_USERNAME
const pass= process.env.DB_PASSWORD

const USERNAME = "mahmashak08";
const PASSWORD = "yasmin-app786";
const url = `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.zics7mf.mongodb.net/?appName=Cluster0"`// Connect to MongoDB
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'.yellow))
  .catch((err) => console.error('MongoDB connection error:'.red, err));
// -----------------------------------

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
//--------------------------------------

app.use( adminRoutes); //dont add "api" it will impact the google oauth sign in

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`.blue));