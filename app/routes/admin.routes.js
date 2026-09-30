import { Router } from "express";
import {
    listUsers,
    updateUser,
    deleteUser,
    // updateUserStatus,
    getInfluencerMetrics,
    // createInfluencer,
    // updateInfluencer,
    // getInfluencers,
    // getSinglInfluencer,
    // deleteInfluencer,
    getSingleUser,
    adminCreateUser,
    getAdminStats
} from "../controllers/admin.controller.js"
import {
    createPolicy,
    getAllPolicies,
    getPolicyById,
    updatePolicy,
    deletePolicy
} from "../controllers/legalPolicy.controller.js";
import { allowedUsers } from "../middleware/authorizationMiddleware.js";
import { validate } from "../middleware/validate.params.js";

import {
    // influencerValidators,
    // statusValidator,
    policyValidator,
    updateUserValidator,
    adminCreateUserValidator,
    courierConfigUpdateValidator
} from "../validators/admin.validators.js";
import {
    getPreferenceOptions,
    createPreferenceOption,
    updatePreferenceOption,
    deletePreferenceOption,

} from "../controllers/category.controller.js";
import {
    getMyNotifications, sendNotificationToAll, sendNotificationToOne
} from "../controllers/notification.controller.js";
import { getCourierConfig, retryCourierShipments, updateCourierConfig } from "../controllers/courier.controller.js";
const router = Router();

//Influencer Management 
router.get("/inf/metrics/:id", allowedUsers("admin", "influencer"), getInfluencerMetrics);
router.get("/stats", getAdminStats);

// ==================================================
router.post("/create-user", validate(adminCreateUserValidator), allowedUsers("admin"), adminCreateUser);
router.get("/get/users", allowedUsers("admin"), listUsers);
router.get("/get/user/:id", allowedUsers(), getSingleUser);
router.put("/update/user/:id", validate(updateUserValidator), allowedUsers("admin", "buyer", "seller", "influencer"), updateUser);
router.delete("/user/delete/:id", allowedUsers(), deleteUser);
// router.get("/get/sellers/requests",  sellerRequests);

// ================================================
router.post("/create/policy", validate(policyValidator), allowedUsers("admin"), createPolicy);
router.get("/get/policy", allowedUsers(), getAllPolicies);
router.get("/get/policy/:id", allowedUsers(), getPolicyById);
router.put("/update/policy/:id", allowedUsers("admin"), updatePolicy);
router.delete("/delete/policy/:id", allowedUsers("admin"), deletePolicy);

// Admin - manage preference options
router.post("/options/create", allowedUsers("admin"), createPreferenceOption);
router.put("/options/update/:id", allowedUsers("admin"), updatePreferenceOption);
router.delete("/options/delete/:id", allowedUsers("admin"), deletePreferenceOption);


// Manage Courier Config Routes
router.get("/courier-config", allowedUsers("admin"), getCourierConfig)
router.patch("/courier-config", validate(courierConfigUpdateValidator), allowedUsers("admin"), updateCourierConfig)
router.post("/:orderId/retry-courier", allowedUsers("admin"), retryCourierShipments);



export default router;