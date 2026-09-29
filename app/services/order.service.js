import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from '../models/product.model.js';
import { createPaymentIntent } from "../controllers/stripe.controller.js";
import { applyShippingDetails } from "../utils/shipping.helper.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export const prepareOrderService = async (buyerId) => {

    const cart = await Cart.findOne({ buyerId })
        .populate({
            path: "items.productId",
            select: "title ownerId price salePrice imageUrls stock status",
            populate: {
                path: "ownerId",
                select: "name phone"
            }
        })
        .populate({
            path: "items.bidId",
            select: "priceOffered status productId buyerId"
        })
        .lean();



    if (!cart || !cart.items?.length) {
        throw new Error("Cart is empty");
    }

    const shipmentMap = new Map();

    for (const item of cart.items) {

        const product = item.productId;
        const bid = item.bidId;

        if (!product) {
            throw new Error(`Product not found`);
        }

        if (product.status !== "approved") {
            throw new Error(
                `Product "${product.title}" is not available`
            );
        }

        if (item.quantity > product.stock) {
            throw new Error(
                `Insufficient stock for product "${product.title}"`
            );
        }


        const { unitPrice, itemTotal } = calculateItemPrice({
            bid,
            product,
            buyerId,
            quantity: item.quantity
        });

        const sellerId = product.ownerId._id.toString();



        if (!shipmentMap.has(sellerId)) {
            shipmentMap.set(sellerId, {
                sellerId: product.ownerId._id,
                sellerName: product.ownerId.name,
                sellerPhone: product.ownerId.phone,

                items: [],
                subtotal: 0,

                shipping: {
                    pickupLocation: null,
                    deliveryLocation: null,
                    deliveryFee: 0,
                    deliveryMethod: null,
                    estimatedDelivery: null
                }
            });
        }

        const shipment = shipmentMap.get(sellerId);



        shipment.items.push({
            productId: product._id,
            bidId: bid?._id || null,
            title: product.title,
            image: product.imageUrls?.[0] || null,
            quantity: item.quantity,
            unitPrice,
            total: itemTotal
        });

        shipment.subtotal += itemTotal;
    }

    const shipments = [...shipmentMap.values()];

    await applyShippingDetails(buyerId, shipments);

    const subtotal = shipments.reduce(
        (sum, shipment) => sum + shipment.subtotal,
        0
    );

    const deliveryCharges = shipments.reduce(
        (sum, s) => sum + s.shipping.deliveryFee, 0
    );
    const discount = 0;

    return {
        buyerId,
        shipments,
        pricing: {
            subtotal,
            deliveryCharges,
            discount,
            total: subtotal + deliveryCharges - discount
        }
    };
};


export const getProductPrice = (product) =>
    product.salePrice ? product.salePrice : product.price;

// order.service.js

const calculateItemPrice = ({ bid, product, buyerId, quantity }) => {

    let unitPrice;

    if (bid) {
        if (bid.buyerId.toString() !== buyerId.toString()) {
            throw new AppError("Invalid bid", 400);
        }

        if (bid.productId.toString() !== product._id.toString()) {
            throw new AppError("Bid does not belong to this product", 400);
        }

        if (bid.status !== "accepted") {
            throw new AppError(`Bid is not accepted for ${product.title}`, 400);
        }

        unitPrice = bid.priceOffered;

    } else {
        unitPrice = getProductPrice(product)
    }

    const itemTotal = unitPrice * quantity;

    return {
        unitPrice,
        itemTotal
    };
};


const validateProduct = (product, quantity) => {

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    if (product.status !== "approved") {
        throw new AppError(
            `Product "${product.title}" is not available`,
            400
        );
    }

    if (product.stock < quantity) {
        throw new AppError(
            `Insufficient stock for ${product.title}`,
            400
        );
    }
};


const orderSettlement = ({ quantity, unitPrice }) => {

    const productAmount = unitPrice * quantity;

    const platformFees = productAmount * 0.20;

    const sellerAmount = productAmount - platformFees;

    return {
        productAmount,
        platformFees,
        sellerAmount
    };
};


const releaseReservedStock = async (reservedItems) => {
    for (const { productId, quantity } of reservedItems) {
        await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } });
    }
};

export const createOrderService = async (buyerId) => {

    const cart = await Cart.findOne({ buyerId })
        .populate({
            path: "items.productId",
            select: "title ownerId price salePrice imageUrls stock status",
            populate: { path: "ownerId", select: "name phone" }
        })
        .populate({
            path: "items.bidId",
            select: "priceOffered status productId buyerId"
        })
        .lean();

    if (!cart || !cart.items?.length) {
        throw new AppError("Cart is empty", 404);
    }

    const shipmentMap = new Map();
    let subtotal = 0;
    let totalPlatformFees = 0;
    let totalSellerAmount = 0;
    let totalInfluencerAmount = 0;
    const reservedItems = [];

    try {
        for (const cartItem of cart.items) {

            const product = cartItem.productId;
            const bid = cartItem.bidId;

            validateProduct(product, cartItem.quantity);

            // Real enforcement point — atomic, race-safe. validateProduct's
            // stock check above is just a fast-fail on the snapshot data.
            const reserved = await Product.findOneAndUpdate(
                { _id: product._id, stock: { $gte: cartItem.quantity } },
                { $inc: { stock: -cartItem.quantity } },
                { new: true }
            );

            if (!reserved) {
                throw new AppError(`Insufficient stock for "${product.title}"`, 400);
            }

            reservedItems.push({ productId: product._id, quantity: cartItem.quantity });

            const { unitPrice, itemTotal } = calculateItemPrice({
                bid, product, buyerId, quantity: cartItem.quantity
            });

            const settlement = orderSettlement({ quantity: cartItem.quantity, unitPrice });

            subtotal += itemTotal;
            totalPlatformFees += settlement.platformFees;
            totalSellerAmount += settlement.sellerAmount;

            const seller = product.ownerId;
            const sellerId = seller._id.toString();

            console.log("Seller ----------------", seller)

            if (!shipmentMap.has(sellerId)) {
                shipmentMap.set(sellerId, {
                    sellerId: seller._id,
                    sellerName: seller.name,
                    sellerPhone: seller.phone,
                    items: [],
                    subtotal: 0,
                    shipping: {
                        pickupLocation: null,
                        deliveryLocation: null,
                        deliveryFee: 0,
                        deliveryMethod: null,
                        estimatedDelivery: null,
                        fourHourEligible: null
                    }
                });
            }

            const shipment = shipmentMap.get(sellerId);
            shipment.items.push({
                title: product.title,
                productId: product._id,
                bidId: bid?._id || null,
                quantity: cartItem.quantity,
                price: unitPrice,
                settlement
            });
            shipment.subtotal += itemTotal;
        }

        const shipments = Array.from(shipmentMap.values());

        await applyShippingDetails(buyerId, shipments);

        const deliveryFee = shipments.reduce((sum, s) => sum + s.shipping.deliveryFee, 0);
        const totalCustomerPays = subtotal + deliveryFee;

        const payment = await createPaymentIntent({
            amount: totalCustomerPays,
            currency: "aed",
            buyerId
        });

        const order = await Order.create({
            buyerId,
            shipments,
            subtotal,
            deliveryFee,
            totalCustomerPays,
            platformFeesPercent: 20,
            platformFeesAmount: totalPlatformFees,
            totalSellerGets: totalSellerAmount,
            stripePaymentIntentId: payment.paymentIntentId,
            paymentStatus: "PENDING",
            deliveryStatus: "PENDING",
            buyerConfirmationStatus: "PENDING",
            settlementStatus: "PENDING",
            status: "pending"
        });

        return {
            orderId: order._id,
            paymentIntentId: payment.paymentIntentId,
            clientSecret: payment.clientSecret,
            shipments,
            pricing: { subtotal, deliveryFee, totalCustomerPays },
            paymentStatus: order.paymentStatus
        };

    } catch (err) {
        await releaseReservedStock(reservedItems);
        throw err;
    }
};


export const getBuyerOrderStatusService = async (orderId, buyerId) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        const error = new Error("Invalid order ID");
        error.statusCode = 400;
        error.responseCode = "01";
        throw error;
    }

    const order = await Order.findOne({
        _id: orderId,
        buyerId,
    })
        .select(
            "shipments subtotal deliveryFee totalCustomerPays paymentStatus deliveryStatus buyerConfirmationStatus status createdAt updatedAt"
        )
        .populate({
            path: "shipments.items.productId",
            select: "title imageUrls",
        })
        .lean();

    if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        error.responseCode = "01";
        throw error;
    }

    return {
        orderId: order._id,

        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryStatus: order.deliveryStatus,
        buyerConfirmationStatus: order.buyerConfirmationStatus,

        pricing: {
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            total: order.totalCustomerPays,
        },

        shipments: order.shipments.map((shipment) => ({
            shipmentId: shipment._id,

            seller: {
                id: shipment.sellerId,
                name: shipment.sellerName,
            },

            items: shipment.items.map((item) => ({
                productId: item.productId?._id || item.productId,
                title: item.productId?.title,
                imageUrls: item.productId?.imageUrls || [],
                bidId: item.bidId,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
            })),

            subtotal: shipment.subtotal,

            shipping: {
                pickupLocation: shipment.shipping?.pickupLocation,
                deliveryLocation: shipment.shipping?.deliveryLocation,
                deliveryFee: shipment.shipping?.deliveryFee,
                deliveryMethod: shipment.shipping?.deliveryMethod,
                estimatedDelivery: shipment.shipping?.estimatedDelivery,
                fourHourEligible: shipment.shipping?.fourHourEligible,
            },

            courier: {
                provider: shipment.courier?.provider,
                status: shipment.courier?.status,
                shipmentId: shipment.courier?.shipmentId,
                trackingNumber: shipment.courier?.trackingNumber,
                trackingUrl: shipment.courier?.trackingUrl,
                quiqupState: shipment.courier?.quiqupState,
                deliveryAttempts: shipment.courier?.deliveryAttempts,
                deliveryFailureReason: shipment.courier?.deliveryFailureReason,
            },

            deliveryStatus: shipment.deliveryStatus,
        })),

        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
};
