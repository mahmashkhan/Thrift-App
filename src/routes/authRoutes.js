const express = require ('express')
const Login = require("../controllers/authLogin")
const  emailVerification = require("../controllers/emailVerification")
const  authSignUp = require("../controllers/authSignUp")
const { verifyToken, authorizeRoles } = require("../config/jwt")
const passport = require("passport")

const router = express.Router();

// router.post("/signup", authSignUp);
router.post('/verify/otp', emailVerification);
router.post("/login", Login);
router.post("/signup", authSignUp);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  router.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login-failed',
      successRedirect: '/login-success',
    })
  );
  router.get('/login-success', (req, res) => {
    
    res.send("Google Login Successful!");
  });
  
  
  router.get('/', (req, res) => {
    res.send(" Google Login Successful!");
  });
  
  router.get('/login-failed', (req, res) => {
    res.send(" Google Login Failed!");
  });

module.exports =  router;
