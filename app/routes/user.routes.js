import { Router } from "express";
import { loginUser, logOut, signupUser, verifyOTP, forgotPassword, resetPassword, resendOtp, addUserReview, getUserReviews, updateUserReview, deleteUserReview } from "../controllers/user.controller.js";
import { signupValidation } from "../validation/user.validation.js";
import {
    getMyNotifications, markAsRead
} from "../controllers/notification.controller.js";
import { getProfile, editProfile, deleteProfile, upgradeToSeller } from "../controllers/profile.controller.js";
import { validate } from "../middleware/validate.params.js";
import { loginValidator, signupValidator, otpValidator, editProfileValidator } from "../validators/auth.validators.js"
import { allowedadminOrOwner } from "../middleware/authorizationMiddleware.js";
import { verifyToken } from "../config/jwt.handle.js";
import { getMyFavourites, toggleFavourite } from "../controllers/favourites.controller.js";
import { allowedUsers } from "../middleware/authorizationMiddleware.js";
import {
    getPreferenceOptions,
    createPreferenceOption,
    updatePreferenceOption,
    deletePreferenceOption,
    setPreferences,
    skipPreferences,
    getMyPreferences,
} from "../controllers/category.controller.js";
import { addUserReviewValidator, updateUserReviewValidator } from "../validators/review.validators.js";
import { setPreferencesValidator, upgradeToSellerValidator } from "../validators/preference.validators.js";
const router = Router();


router.post("/signup", validate(signupValidator), signupUser);
router.post("/resend/otp", validate(signupValidator), resendOtp);
router.post('/verify/otp', validate(otpValidator), verifyOTP);
router.post("/login", validate(loginValidator), loginUser);
router.post("/logout", logOut);

// Forgot Password Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

//Profile
router.get("/profile/:id", getProfile);
router.patch("/update/profile/:id", allowedadminOrOwner, validate(editProfileValidator), editProfile);
router.delete("/delete/profile/:id", allowedadminOrOwner, deleteProfile);
router.patch("/upgrade-to-seller", validate(upgradeToSellerValidator), allowedUsers("buyer"), upgradeToSeller);

//Preferences
router.get("/options", getPreferenceOptions);



// User preferences
router.patch("/preferences/set", validate(setPreferencesValidator), allowedUsers(), setPreferences);
router.patch("/preferences/skip", allowedUsers(), skipPreferences);
router.get("/preferences/me", allowedUsers(), getMyPreferences);



//notification
router.get('/my', verifyToken, getMyNotifications);

router.patch('/read-all',verifyToken, validate(loginValidator), markAsRead);
// router.delete('/:id', validate(loginValidator), deleteNotification);

//user reviews (for sellers & influencers)
router.post("/review/add", validate(addUserReviewValidator), allowedUsers(), addUserReview);
router.get("/review/:sellerId", allowedUsers(), getUserReviews);
router.put("/review/update/:reviewId", validate(updateUserReviewValidator), allowedUsers(), updateUserReview);
router.delete("/review/delete/:reviewId", allowedUsers(), deleteUserReview);

export default router;