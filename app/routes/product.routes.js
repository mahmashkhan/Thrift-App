import { Router } from "express";
import { addProductToFavourite, createProduct, deleteProduct, getBuyerFavourites, getProductByStatus, getProductsByOwner, getSingleProduct, removeItemFromFav, searchProdByFilter, updateProductData, updateProductStatus, addReview, getProductReviews, updateReview, deleteReview } from "../controllers/product.controller.js";
import { verifyToken } from "../config/jwt.handle.js";
import { allowedUsers } from "../middleware/authorizationMiddleware.js";
import { validate } from "../middleware/validate.params.js";
import { productValidator, productUpdateValidator } from "../validators/product.validators.js";
import { addProductReviewValidator, updateProductReviewValidator } from "../validators/review.validators.js";

const router = Router();


router.post("/create",validate(productValidator), allowedUsers("admin", "seller"), createProduct);
router.get("/get", allowedUsers("admin", "seller"), getProductByStatus);
router.get("/search", allowedUsers(), searchProdByFilter);
router.get("/:id", allowedUsers(), getSingleProduct);
router.get("/owner/:id", allowedUsers("admin", "seller", "influencer"), getProductsByOwner);
router.put("/update/:id",validate(productUpdateValidator), allowedUsers("admin", "seller"), updateProductData);
router.put("/update/status/:id", allowedUsers("admin"), updateProductStatus);
router.delete("/delete/:id", allowedUsers("admin", "seller"), deleteProduct);

router.post("/favourite/add", allowedUsers(), addProductToFavourite);
router.get("/favourite/get/:buyerId", allowedUsers(), getBuyerFavourites);
router.delete("/favourite/remove/:itemId", allowedUsers(), removeItemFromFav);

router.post("/review/add", validate(addProductReviewValidator), allowedUsers(), addReview);
router.get("/review/:productId", allowedUsers(), getProductReviews);
router.put("/review/update/:reviewId", validate(updateProductReviewValidator), allowedUsers(), updateReview);
router.delete("/review/delete/:reviewId", allowedUsers(), deleteReview);
// router.get("/favourite/get/item/:item", addProductToFavourite);

// router.get("/get/inf/product", getAllProducts);
// // router.get("/get/inf/product/:id", getProductById);
// router.put("/update/inf/product/:id", updateProduct);
// router.post("/change/inf/product/:id/status", updateProductStatus);
// router.delete("/delete/:id", deleteProduct);
// router.get("/get/inf/product/:id", getProductsByInfluencerId);

export default router;