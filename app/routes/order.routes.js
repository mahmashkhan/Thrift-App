import { Router } from "express";
import { acceptBid, addToCart, checkOut, createBid, getBuyerOrders, getOwnerOrders, getProductBids, getProductOrders, 
     rejectBid, ViewCart } from "../controllers/order.controller.js";
import { verifyToken } from "../config/jwt.handle.js";

const router = Router();

router.post('/bid/create', verifyToken, createBid);
router.get('/bid/get/:productId', getProductBids);
router.post('/bid/accept/:bidId', verifyToken, acceptBid);
router.post('/bid/reject/:bidId', verifyToken, rejectBid);
router.post('/cart/add', verifyToken, addToCart);
router.get('/cart/get/:buyerId', verifyToken, ViewCart);
router.post('/checkout', verifyToken, checkOut);
router.get('/get/buyer/:buyerId', verifyToken, getBuyerOrders);
router.get('/get/owner/:ownerId', verifyToken, getOwnerOrders);
router.get('/get/product/:productId', verifyToken, getProductOrders);



export default router;
