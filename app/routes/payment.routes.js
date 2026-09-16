import { Router } from "express";

import {
    createPaymentIntent
} from "../controllers/payment.controller.js";

import {
    allowedUsers
} from "../middleware/authorizationMiddleware.js";

const router = Router();

router.post(
    "/create",
    allowedUsers(),
    createPaymentIntent
);

export default router;