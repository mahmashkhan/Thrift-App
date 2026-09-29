import CourierConfigModel from "../models/courier.config.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import courierConfigModel from "../models/courier.config.model.js";
import Order from "../models/order.model.js";
import { createCourierShipmentsForOrder, handleQuiqupEvent } from "../services/courier.service.js";
import crypto from "crypto";

const ALLOWED_TOP_LEVEL_FIELDS = ["baseFee", "fuelSurchargePercent", "vatPercent", "radiusKm"];
const ALLOWED_BEYOND_RADIUS_FIELDS = ["feeType", "flatFee", "perKmRate"];

export const getCourierConfig = catchAsync(async (req, res, next) => {
    const config = await CourierConfigModel.findOne();

    if (!config) {
        return next(new AppError("Courier config has not been set up yet", 404));
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: config
    });
});

export const updateCourierConfig = catchAsync(async (req, res, next) => {
    const { beyondRadius } = req.body;

    if (beyondRadius?.feeType === "flat" && beyondRadius?.flatFee == null) {
        return next(new AppError("flatFee is required when feeType is 'flat'", 400));
    }

    if (beyondRadius?.feeType === "per_km" && beyondRadius?.perKmRate == null) {
        return next(new AppError("perKmRate is required when feeType is 'per_km'", 400));
    }

    const updates = {};

    for (const key of ALLOWED_TOP_LEVEL_FIELDS) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (beyondRadius) {
        for (const key of ALLOWED_BEYOND_RADIUS_FIELDS) {
            if (beyondRadius[key] !== undefined) {
                updates[`beyondRadius.${key}`] = beyondRadius[key];
            }
        }
    }

    if (Object.keys(updates).length === 0) {
        return next(new AppError("No valid fields provided", 400));
    }

    updates.updatedBy = req.user.id;

    const config = await courierConfigModel.findOneAndUpdate(
        {},
        { $set: updates },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: config
    });
});

export const retryCourierShipments = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError("Order not found", 404));
    }

    if (order.paymentStatus !== "PAID") {
        return next(new AppError("Order has not been paid yet — nothing to ship", 400));
    }

    await createCourierShipmentsForOrder(order._id);

    const updated = await Order.findById(orderId);

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: {
            orderId: updated._id,
            shipments: updated.shipments.map(s => ({
                sellerId: s.sellerId,
                sellerName: s.sellerName,
                courier: s.courier
            }))
        }
    });
});



const verifyQuiqupSignature = (rawBody, signatureHeader) => {
    if (!signatureHeader) return false;

    const [algo, providedHash] = signatureHeader.split("=");
    if (algo !== "sha1" || !providedHash) return false;

    const computedHash = crypto
        .createHmac("sha1", process.env.QUIQUP_WEBHOOK_TOKEN)
        .update(rawBody)
        .digest("hex");

    const provided = Buffer.from(providedHash, "utf8");
    const computed = Buffer.from(computedHash, "utf8");

    if (provided.length !== computed.length) return false;

    return crypto.timingSafeEqual(provided, computed);
};


export const handleQuiqupWebhook = catchAsync(async (req, res) => {
    const signature = req.headers["x-signature"];

    if (!verifyQuiqupSignature(req.body, signature)) {
        console.error("Quiqup webhook signature verification failed");
        return res.status(401).json({ received: false });
    }

    let event;
    try {
        event = JSON.parse(req.body.toString("utf8"));
    } catch (err) {
        console.error("Quiqup webhook: invalid JSON body");
        return res.status(400).json({ received: false });
    }

    // Same reasoning as Stripe: ack fast, process after responding
    res.status(200).json({ received: true });

    handleQuiqupEvent(event).catch((err) => {
        console.error("Error processing Quiqup webhook event:", err);
    });
});