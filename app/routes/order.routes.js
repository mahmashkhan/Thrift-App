import { Router } from "express";
import { acceptBid, addToCart, checkOut, createBid, getBuyerOrders, getProductBids, getProductOrders, getSellerOrders, rejectBid, ViewCart } from "../controllers/order.controller.js";
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
router.get('/get/seller/:sellerId', verifyToken, getSellerOrders);
router.get('/get/product/:productId', verifyToken, getProductOrders);



export default router;
