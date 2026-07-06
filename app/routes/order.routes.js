import { Router } from "express";
import { acceptBid, addToCart, checkOut, createBid, getBuyerOrders, getOwnerOrders, getProductBids, getProductOrders, 
     rejectBid, ViewCart, 
     withdrawBid} from "../controllers/order.controller.js";
import { verifyToken } from "../config/jwt.handle.js";
import { allowedUsers } from "../middleware/authorizationMiddleware.js";
import { createBidValidator } from "../validators/order.validators.js";
import { validate } from "../middleware/validate.params.js";

const router = Router();

router.post('/bid/create', allowedUsers(), validate(createBidValidator), createBid);
router.get('/bid/get/:productId', allowedUsers("admin", "seller"), getProductBids);
router.post('/bid/accept/:bidId', allowedUsers("admin", "seller"), acceptBid);
router.post('/bid/reject/:bidId', allowedUsers("admin", "seller"), rejectBid);
router.post('/bid/withdraw/:bidId', allowedUsers(), withdrawBid);
router.post('/cart/add', allowedUsers(), addToCart);
router.get('/cart/get/:buyerId', allowedUsers(), ViewCart);
router.post('/checkout', allowedUsers(), checkOut);
router.get('/get/buyer/:buyerId', allowedUsers("admin", "buyer"), getBuyerOrders);
router.get('/get/owner/:ownerId', allowedUsers("admin", "seller", "influencer"), getOwnerOrders);
router.get('/get/product/:productId', allowedUsers("admin", "seller, influencer"), getProductOrders);



export default router;
