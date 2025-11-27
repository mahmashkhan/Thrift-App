import { Router } from "express";
import { addProductToFavourite, createProduct, deleteProduct, getBuyerFavourites, getProductByStatus, getProductsByOwner, getSingleProduct, removeItemFromFav, searchProdByFilter, updateProductData, updateProductStatus } from "../controllers/product.controller.js";
import { verifyToken } from "../config/jwt.handle.js";
import { allowedUsers } from "../validation/validation.js";
const router = Router();


router.post("/create", allowedUsers("admin", "seller"), createProduct);
router.get("/get", allowedUsers("admin", "seller"), getProductByStatus);
router.get("/search", allowedUsers(), searchProdByFilter);
router.get("/:id", allowedUsers(), getSingleProduct);
router.get("/owner/:id", allowedUsers("admin", "seller", "influencer"), getProductsByOwner);
router.put("/update/:id", allowedUsers("admin", "seller"), updateProductData);
router.put("/update/status/:id", allowedUsers("admin"), updateProductStatus);
router.delete("/delete/:id", allowedUsers("admin", "seller"), deleteProduct);

router.post("/favourite/add", allowedUsers(), addProductToFavourite);
router.get("/favourite/get/:buyerId", allowedUsers(), getBuyerFavourites);
router.delete("/favourite/remove/:itemId", allowedUsers(), removeItemFromFav);
// router.get("/favourite/get/item/:item", addProductToFavourite);

// router.get("/get/inf/product", getAllProducts);
// // router.get("/get/inf/product/:id", getProductById);
// router.put("/update/inf/product/:id", updateProduct);
// router.post("/change/inf/product/:id/status", updateProductStatus);
// router.delete("/delete/:id", deleteProduct);
// router.get("/get/inf/product/:id", getProductsByInfluencerId);

export default router;