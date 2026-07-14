import { Router } from "express";
import { addProductToFavourite, createProduct, deleteProduct, getBuyerFavourites, getProductByStatus, getProductsByOwner, getSingleProduct, removeItemFromFav, searchProdByFilter, updateProductData, updateProductStatus, addReview, getProductReviews, updateReview, deleteReview, getRootCategories, getChildCategories, getCategory, updateCategory, getProductsByCategory } from "../controllers/product.controller.js";
import { verifyToken } from "../config/jwt.handle.js";
import { allowedUsers, optionalAuth } from "../middleware/authorizationMiddleware.js";
import { validate } from "../middleware/validate.params.js";
import { productValidator, productUpdateValidator } from "../validators/product.validators.js";
import { addProductReviewValidator, updateProductReviewValidator } from "../validators/review.validators.js";
import { createCategory } from "../controllers/product.controller.js";

const router = Router();


router.post("/create", validate(productValidator), allowedUsers("admin", "seller"), createProduct);
router.get("/get", allowedUsers("admin", "seller"), getProductByStatus);
router.get("/search", optionalAuth, searchProdByFilter);
router.get("/:id", allowedUsers(), getSingleProduct);
router.get("/owner/:id", allowedUsers("admin", "seller", "influencer"), getProductsByOwner);
router.get("/category/:categoryId", allowedUsers(), getProductsByCategory);
router.put("/update/:id", validate(productUpdateValidator), allowedUsers("admin", "seller"), updateProductData);
router.put("/update/status/:id", allowedUsers("admin"), updateProductStatus);
router.delete("/delete/:id", allowedUsers("admin", "seller"), deleteProduct);

router.post("/favourite/add", allowedUsers(), addProductToFavourite);
router.get("/favourite/get/:buyerId", allowedUsers(), getBuyerFavourites);
router.delete("/favourite/remove/:itemId", allowedUsers(), removeItemFromFav);

router.post("/review/:productId", validate(addProductReviewValidator), allowedUsers(), addReview);
router.get("/review/:productId", allowedUsers(), getProductReviews);
router.put("/review/:reviewId", validate(updateProductReviewValidator), allowedUsers(), updateReview);
router.delete("/review/:reviewId", allowedUsers(), deleteReview);
// router.get("/favourite/get/item/:item", addProductToFavourite);

// router.get("/get/inf/product", getAllProducts);
// // router.get("/get/inf/product/:id", getProductById);
// router.put("/update/inf/product/:id", updateProduct);
// router.post("/change/inf/product/:id/status", updateProductStatus);
// router.delete("/delete/:id", deleteProduct);
// router.get("/get/inf/product/:id", getProductsByInfluencerId);



router.post('/categories/create', allowedUsers('admin'), createCategory)
router.get('/categories/get', allowedUsers(), getRootCategories);
router.get('/categories/get/:id', allowedUsers(), getCategory);
// router.get('/categories/:parentId/children', allowedUsers(), getChildCategories);
router.put('/categories/update/:id', allowedUsers(), updateCategory);

export default router;