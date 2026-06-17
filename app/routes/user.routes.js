import { Router } from "express";
import { loginUser, logOut, signupUser, verifyOTP } from "../controllers/user.controller.js";
import { signupValidation } from "../validation/user.validation.js";
import {
    getMyNotifications, markAsRead
} from "../controllers/notification.controller.js";
import { getProfile, editProfile, deleteProfile } from "../controllers/profile.controller.js";
import { validate } from "../middleware/validate.params.js";
import { loginValidator, signupValidator, otpValidator, editProfileValidator } from "../validators/auth.validators.js"
import { allowedadminOrOwner } from "../middleware/authorizationMiddleware.js";
import { verifyToken } from "../config/jwt.handle.js";
import { isFavourite,getMyFavourites, toggleFavourite } from "../controllers/favourites.js";
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

//favourites

router.get('/favourites', verifyToken, getMyFavourites);   // get all favourites
router.patch('/add/favourites/:productId', verifyToken, toggleFavourite);  // add or remove
router.get('/favourites/:productId', verifyToken, isFavourite);       // check if favourite


//notification
router.get('/my', verifyToken, getMyNotifications);

router.patch('/read-all',verifyToken, validate(loginValidator), markAsRead);
// router.delete('/:id', validate(loginValidator), deleteNotification);
export default router;