import { Router } from "express";
import { createProduct, deleteProduct, getBuyerFavourites, getProductByStatus, getProductsByOwner, getSingleProduct, updateProductData, updateProductStatus } from "../controllers/product.controller.js";
import { verifyToken } from "../config/jwt.handle.js";
const router = Router();


router.post("/create", verifyToken, createProduct);
router.get("/get", getProductByStatus);
router.get("/:id", getSingleProduct);
router.get("/owner/:id", getProductsByOwner);
router.put("/update/:id", updateProductData);
router.put("/update/status/:id", updateProductStatus);
router.delete("/delete/:id", deleteProduct);

router.post("/favourite/add", addProductToFavourite);
router.get("/favourite/get/:buyerId", getBuyerFavourites);
// router.get("/favourite/get/item/:item", addProductToFavourite);

// router.get("/get/inf/product", getAllProducts);
// // router.get("/get/inf/product/:id", getProductById);
// router.put("/update/inf/product/:id", updateProduct);
// router.post("/change/inf/product/:id/status", updateProductStatus);
// router.delete("/delete/:id", deleteProduct);
// router.get("/get/inf/product/:id", getProductsByInfluencerId);

export default router;