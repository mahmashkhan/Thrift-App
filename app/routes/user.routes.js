import { Router } from "express";
import { createUser, loginUser, verifyOTP } from "../controllers/user.controller.js";
const router = Router();


router.post('/verify/otp', verifyOTP);
router.post("/login", loginUser);
router.post("/signup", createUser);


export default router;