import { Router } from "express";
import { listUsers, updateUser, deleteUser, updateUserStatus, getInfluencerMetrics, createInfluencer, updateInfluencer, getInfluencers, getSinglInfluencer, deleteInfluencer, getSingleUser } from "../controllers/admin.controller.js"
import { createPolicy, getAllPolicies, getPolicyById, updatePolicy, deletePolicy } from "../controllers/legalPolicy.controller.js";
import { allowedUsers } from "../validation/validation.js"
const router = Router();



//Influencer Management 
router.post("/inf/create", allowedUsers("admin"), createInfluencer);
router.get("/inf/get", allowedUsers("admin"), getInfluencers);
router.get("/inf/get/:id", allowedUsers("admin", "influencer"), getSinglInfluencer);
router.put("/inf/update/:id", allowedUsers("admin", "influencer"), updateInfluencer);
router.delete("/inf/delete/:id", allowedUsers("admin", "influencer"), deleteInfluencer);
router.get("/inf/metrics/:id", allowedUsers("admin", "influencer"), getInfluencerMetrics);


// ==================================================
router.get("/get/users", allowedUsers("admin"), listUsers);
router.get("/get/user/:id", allowedUsers(), getSingleUser);
router.put("/update/user/:id", allowedUsers(), updateUser);
router.delete("/user/delete/:id", allowedUsers(), deleteUser);
router.post("/update/users/status/:id", allowedUsers("admin"), updateUserStatus);
// router.get("/get/sellers/requests",  sellerRequests);
router.get("/get/influencers/metrics/:id", getInfluencerMetrics);
// ================================================
router.post("/create/policy", allowedUsers("admin"), createPolicy);
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