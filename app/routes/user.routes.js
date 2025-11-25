import { Router } from "express";
import { createUser, loginUser, verifyOTP } from "../controllers/user.controller.js";
import { signupValidation } from "../validation/user.validation.js";
import { getProfile,editProfile,deleteProfile } from "../controllers/profile.controller.js";
import { validate } from "../middleware/validate.params.js";
import {loginValidator,signupValidator} from "../validators/auth.validators.js"
const router = Router();


router.post("/create",validate(signupValidator), createUser);
router.post('/verify/otp', verifyOTP);
router.post("/login",validate(loginValidator), loginUser);

//Profile
router.get("/profile/:id", getProfile);
router.patch("/edit/profile/:id", editProfile);
router.delete("/delete/profile/:id", deleteProfile);
// router.post("/influencer/signup", signupValidation, createUser);

export default router;