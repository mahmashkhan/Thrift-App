import { Router } from "express";
import {
    createInfluencers,
    getInfluencers,
    getInfluencerById,
    updateInfluencer,
    deleteInfluencer
} from "../controllers/influencer.controller.js";
import {
    listUsers,
    getUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    getInfluencerMetrics
} from "../controllers/admin.controller.js"
import {
    createPolicy,
    getAllPolicies,
    getPolicyById,
    updatePolicy,
    deletePolicy
} from "../controllers/legalPolicy.controller.js";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    updateProductStatus,
    deleteProduct,
    getProductsByInfluencerId
} from "../controllers/influencer.products.controller.js"
import { isAdmin } from "../validation/admin.validation.js"
const router = Router();


router.post("/add/inf/product", createProduct);
router.get("/get/inf/product", getAllProducts);
// router.get("/get/inf/product/:id", getProductById);
router.put("/update/inf/product/:id", updateProduct);
router.post("/change/inf/product/:id/status", updateProductStatus);
router.delete("/delete/:id", deleteProduct);
router.get("/get/inf/product/:id", getProductsByInfluencerId);



// ==================================================
router.get("/get/users", listUsers);
router.get("/get/users/:id", getUser);
router.put("/update/users/:id", updateUser);
router.delete("/delete/users/:id", deleteUser);
router.post("/update/users/status/:id", updateUserStatus);
// router.get("/get/sellers/requests",  sellerRequests);
router.get("/get/influencers/metrics/:id", getInfluencerMetrics);
// ================================================
router.post("/create/policy", createPolicy);
router.get("/get/policy", getAllPolicies);
router.get("/get/policy/:id", getPolicyById);
router.put("/update/policy/:id", updatePolicy);
router.delete("/delete/policy/:id", deletePolicy);




router.post('/create/influencer', createInfluencers);

// Get all influencers
router.get('/influencer', getInfluencers);

// Get single influencer
router.get('/influencer/:id', getInfluencerById);

// Update influencer
router.put('/update/influencer/:id', updateInfluencer);

// Delete influencer
router.delete('/delete/influencer/:id', deleteInfluencer);




export default router;