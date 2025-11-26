import { Router } from "express";
import { listUsers, updateUser, deleteUser, updateUserStatus, getInfluencerMetrics, createInfluencer, updateInfluencer, getInfluencers, getSinglInfluencer, deleteInfluencer, getSingleUser } from "../controllers/admin.controller.js"
import { createPolicy, getAllPolicies, getPolicyById, updatePolicy, deletePolicy } from "../controllers/legalPolicy.controller.js";
// import {   getProductById, updateProduct, updateProductStatus, deleteProduct, getProductsByInfluencerId } from "../controllers/influencer.products.controller.js"
import { isAdmin } from "../validation/admin.validation.js"
import { validate } from "../middleware/validate.params.js";
import { statusValidator, influencerValidators ,policyValidator} from "../validators/admin.validators.js";
const router = Router();



//Influencer Management 
router.post("/inf/create", validate(influencerValidators), createInfluencer);
router.get("/inf/get", getInfluencers);
router.get("/inf/get/:id", getSinglInfluencer);
router.put("/inf/update/:id", updateInfluencer);
router.delete("/inf/delete/:id", deleteInfluencer);
router.get("/inf/metrics/:id", getInfluencerMetrics);




// router.post("/add/inf/product", createProduct);
// router.get("/get/inf/product", getAllProducts);
// // router.get("/get/inf/product/:id", getProductById);
// router.put("/update/inf/product/:id", updateProduct);
// router.post("/change/inf/product/:id/status", updateProductStatus);
// router.delete("/delete/:id", deleteProduct);
// router.get("/get/inf/product/:id", getProductsByInfluencerId);



// ==================================================
router.get("/get/users", listUsers);
router.get("/get/user/:id", getSingleUser);
router.put("/update/user/:id", updateUser);
router.delete("/user/delete/:id", deleteUser);
router.post("/update/users/status/:id", validate(statusValidator), updateUserStatus);
// router.get("/get/sellers/requests",  sellerRequests);
router.get("/get/influencers/metrics/:id", getInfluencerMetrics);
// ================================================

router.post("/create/policy",validate(policyValidator), createPolicy);
router.get("/get/policy", getAllPolicies);
router.get("/get/policy/:id", getPolicyById);
router.put("/update/policy/:id", updatePolicy);
router.delete("/delete/policy/:id", deletePolicy);
// ================================================
router.put('/update/influencer/:id', updateInfluencer);


export default router;