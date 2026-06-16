import { Router } from "express";
import { loginUser, logOut, signupUser, verifyOTP } from "../controllers/user.controller.js";
import { signupValidation } from "../validation/user.validation.js";
import {
    getMyNotifications, sendNotificationToAll
} from "../controllers/notification.controller.js";
import { getProfile, editProfile, deleteProfile } from "../controllers/profile.controller.js";
import { validate } from "../middleware/validate.params.js";
import { loginValidator, signupValidator, otpValidator, editProfileValidator } from "../validators/auth.validators.js"
import { allowedadminOrOwner } from "../middleware/authorizationMiddleware.js";
import { verifyToken } from "../config/jwt.handle.js";
const router = Router();


router.post("/signup", validate(signupValidator), signupUser);
// router.post("/resend/otp", validate(signupValidator), resendOtp);
router.post('/verify/otp', validate(otpValidator), verifyOTP);
router.post("/login", validate(loginValidator), loginUser);
router.post("/logout", logOut);

//Profile
router.get("/profile/:id", getProfile);
router.patch("/update/profile/:id", allowedadminOrOwner, validate(editProfileValidator), editProfile);
router.delete("/delete/profile/:id", allowedadminOrOwner, deleteProfile);
// router.post("/influencer/signup", signupValidation, createUser);


//notification
router.get('/my',verifyToken, getMyNotifications);

// router.patch('/read-all', validate(loginValidator), markAllAsRead);
// router.delete('/:id', validate(loginValidator), deleteNotification);
export default router;