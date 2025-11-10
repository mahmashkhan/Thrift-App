const express = require ('express')
const Login = require("../controllers/authLogin")
const  emailVerification = require("../controllers/emailVerification")
const  authSignUp = require("../controllers/authSignUp")

const router = express.Router();

// router.post("/signup", authSignUp);
router.post('/verify/otp', emailVerification);
router.post("/login", Login);
router.post("/signup", authSignUp);


module.exports =  router;
