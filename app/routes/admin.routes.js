import { Router } from "express";
import {
    listUsers,
    updateUser,
    deleteUser,
    updateUserStatus,
    getInfluencerMetrics,
    createInfluencer,
    updateInfluencer,
    getInfluencers,
    getSinglInfluencer,
    deleteInfluencer,
    getSingleUser
} from "../controllers/admin.controller.js"
import {
    createPolicy,
    getAllPolicies,
    getPolicyById,
    updatePolicy,
    deletePolicy
} from "../controllers/legalPolicy.controller.js";
import { allowedUsers } from "../validation/validation.js";
import { validate } from "../middleware/validate.params.js";

import {
    influencerValidators,
    statusValidator,
    policyValidator,
    updateUserValidator
} from "../validators/admin.validators.js"
const router = Router();

//Influencer Management 
router.post("/inf/create", validate(influencerValidators), allowedUsers("admin"), createInfluencer);
router.get("/inf/get", allowedUsers("admin"), getInfluencers);
router.get("/inf/get/:id", allowedUsers("admin", "influencer"), getSinglInfluencer);
router.put("/inf/update/:id", allowedUsers("admin", "influencer"), updateInfluencer);
router.delete("/inf/delete/:id", allowedUsers("admin", "influencer"), deleteInfluencer);
router.get("/inf/metrics/:id", allowedUsers("admin", "influencer"), getInfluencerMetrics);


// ==================================================
router.get("/get/users", allowedUsers("admin"), listUsers);
router.get("/get/user/:id", allowedUsers(), getSingleUser);
router.put("/update/user/:id", validate(updateUserValidator), allowedUsers(), updateUser);
router.delete("/user/delete/:id", allowedUsers(), deleteUser);
router.post("/update/users/status/:id", validate(statusValidator), allowedUsers("admin"), updateUserStatus);
// router.get("/get/sellers/requests",  sellerRequests);

// ================================================
router.post("/create/policy", validate(policyValidator), allowedUsers("admin"), createPolicy);
router.get("/get/policy", allowedUsers(), getAllPolicies);
router.get("/get/policy/:id", allowedUsers(), getPolicyById);
router.put("/update/policy/:id", allowedUsers("admin"), updatePolicy);
router.delete("/delete/policy/:id", allowedUsers("admin"), deletePolicy);




// router.post('/create/influencer', createInfluencers);

// Get all influencers
// router.get('/influencer', getInfluencers);

// Update influencer
// router.put('/update/influencer/:id', updateInfluencer);





export default router;