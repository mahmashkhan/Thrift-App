import { Router } from "express";
import { loginUser, logOut, signupUser, verifyOTP, forgotPassword, resendOtp, addUserReview, getUserReviews, updateUserReview, deleteUserReview, createSellerProfile, getSellerProfile, updateSellerProfile, deleteSellerProfile, updateForgottenPass, changePassword, googleLogin, facebookLogin, appleLogin, addNewAddress, getUserAddresses, updateAddress, deleteAddress, setDefaultAddress } from "../controllers/user.controller.js";
import { signupValidation } from "../validation/user.validation.js";
import {
    getMyNotifications, markAsRead
} from "../controllers/notification.controller.js";
import { getProfile, editProfile, deleteProfile } from "../controllers/profile.controller.js";
import { validate } from "../middleware/validate.params.js";
import { loginValidator, signupValidator, otpValidator, editProfileValidator, sellerProfileValidator, resendOtpValidator, resetForgottenPassValidator, changePasswordValidator, addNewAddressValidator } from "../validators/auth.validators.js"
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
import { setPreferencesValidator } from "../validators/preference.validators.js";
const router = Router();


router.post("/signup", validate(signupValidator), signupUser);
router.post("/resend/otp", validate(resendOtpValidator), resendOtp);
router.post('/verify/otp', validate(otpValidator), verifyOTP);
router.post("/login", validate(loginValidator), loginUser);
router.post("/logout", logOut);
router.post("/google/login", googleLogin);
router.post("/facebook/login", facebookLogin);
router.post("/apple/login", appleLogin);


// Forgot Password Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify/forget/password', validate(resetForgottenPassValidator), updateForgottenPass);
router.post('/password/change', allowedUsers(), validate(changePasswordValidator), changePassword);

router.post('/addresses', allowedUsers(), validate(addNewAddressValidator), addNewAddress);
router.get('/addresses', allowedUsers(), getUserAddresses);
router.patch('/addresses/:addressId', allowedUsers(), updateAddress);
router.delete('/addresses/:addressId', allowedUsers(), deleteAddress);
router.patch('/addresses/default/:addressId', allowedUsers(), setDefaultAddress);


// Seller Profile
router.post("/seller/profile", validate(sellerProfileValidator), allowedUsers("buyer"), createSellerProfile);
router.get("/seller/profile/:userId", allowedUsers("seller", "admin"), getSellerProfile);
router.put("/seller/profile/:userId", allowedUsers("seller", "admin"), updateSellerProfile);
router.delete("/seller/profile/:userId", allowedUsers("seller", "admin"), deleteSellerProfile);

//Profile
router.get("/profile/:id", getProfile);
router.patch("/update/profile/:id", allowedadminOrOwner, validate(editProfileValidator), editProfile);
router.delete("/delete/profile/:id", allowedadminOrOwner, deleteProfile);

//Preferences
router.get("/options", getPreferenceOptions);



// User preferences
router.patch("/preferences/set", validate(setPreferencesValidator), allowedUsers(), setPreferences);
router.patch("/preferences/skip", allowedUsers(), skipPreferences);
router.get("/preferences/me", allowedUsers(), getMyPreferences);



//notification
router.get('/my', verifyToken, getMyNotifications);

router.patch('/read-all', verifyToken, validate(loginValidator), markAsRead);
// router.delete('/:id', validate(loginValidator), deleteNotification);

//user reviews (for sellers & influencers)
router.post("/review/:revieweeId", validate(addUserReviewValidator), allowedUsers(), addUserReview);
router.get("/review/:revieweeId", allowedUsers(), getUserReviews);
router.put("/review/:reviewId", validate(updateUserReviewValidator), allowedUsers(), updateUserReview);
router.delete("/review/:reviewId", allowedUsers(), deleteUserReview);

export default router;