import { Router } from "express";
import { createProduct, deleteProduct, getProductByStatus, getProductsByOwner, getSingleProduct, updateProductData, updateProductStatus } from "../controllers/product.controller.js";
const router = Router();


router.post("/create", createProduct);
router.get("/get", getProductByStatus);
router.get("/:id", getSingleProduct);
router.get("/owner/:id", getProductsByOwner);
router.put("/update/:id", updateProductData);
router.put("/update/status/:id", updateProductStatus);
router.delete("/delete/:id", deleteProduct);
// router.get("/get/inf/product", getAllProducts);
// // router.get("/get/inf/product/:id", getProductById);
// router.put("/update/inf/product/:id", updateProduct);
// router.post("/change/inf/product/:id/status", updateProductStatus);
// router.delete("/delete/:id", deleteProduct);
// router.get("/get/inf/product/:id", getProductsByInfluencerId);

export default router;