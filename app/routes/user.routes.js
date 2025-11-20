import { Router } from "express";
import { createUser, loginUser, verifyOTP } from "../controllers/user.controller.js";
import { signupValidation } from "../validation/user.validation.js";
const router = Router();


router.post("/create", createUser);
router.post('/verify/otp', verifyOTP);
router.post("/login", loginUser);
// router.post("/influencer/signup", signupValidation, createUser);


// Product Management 



export default router;