import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Bid from "../models/bid.model.js";
import stripe from "../config/stripe.js";
import Order from "../models/order.model.js";
import { createPaymentIntent } from "../controllers/stripe.controller.js";

export const prepareOrderService = async (buyerId) => {

    const cart = await Cart.findOne({ buyerId })
        .populate({
            path: "items.productId",
            select: "title ownerId price salePrice imageUrls stock status",
            populate: {
                path: "ownerId",
                select: "name"
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

        // Bid price or normal product price
        const unitPrice = bid
            ? bid.priceOffered
            : product.salePrice;

        if (bid) {

            if (bid.buyerId.toString() !== buyerId.toString()) {
                throw new Error("Invalid bid");
            }

            if (bid.productId.toString() !== product._id.toString()) {
                throw new Error(
                    "Bid does not belong to the selected product"
                );
            }

            if (bid.status !== "accepted") {
                throw new Error(
                    `Bid is not accepted for "${product.title}"`
                );
            }
        }

        const itemTotal = unitPrice * item.quantity;

        const sellerId = product.ownerId._id.toString();

        if (!shipmentMap.has(sellerId)) {
            shipmentMap.set(sellerId, {
                sellerId: product.ownerId._id,
                sellerName: product.ownerId.name,

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

    const subtotal = shipments.reduce(
        (sum, shipment) => sum + shipment.subtotal,
        0
    );

    const deliveryCharges = 0;
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
        unitPrice = product.salePrice ? product.salePrice : product.price;
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

export const createOrderService = async (buyerId) => {

    const cart = await Cart.findOne({ buyerId })
        .populate({
            path: "items.productId",
            select: "title ownerId price salePrice imageUrls stock status",
            populate: {
                path: "ownerId",
                select: "name"
            }
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

    for (const cartItem of cart.items) {

        const product = cartItem.productId;
        const bid = cartItem.bidId;

        validateProduct(product, cartItem.quantity);

        // --------------------------------
        // Determine product price
        // --------------------------------

        const { unitPrice, itemTotal } = calculateItemPrice({
            bid,
            product,
            buyerId,
            quantity: cartItem.quantity
        });


        // --------------------------------
        // Settlement
        // --------------------------------

        const settlement = orderSettlement({
            quantity: cartItem.quantity,
            unitPrice
        });

        subtotal += itemTotal;

        totalPlatformFees += settlement.platformFees;

        totalSellerAmount += settlement.sellerAmount;

        // totalInfluencerAmount += settlement.influencerAmount;


        // --------------------------------
        // Shipment
        // --------------------------------

        const seller = product.ownerId;

        const sellerId = seller._id.toString();

        if (!shipmentMap.has(sellerId)) {

            shipmentMap.set(sellerId, {
                sellerId: seller._id,
                sellerName: seller.name,

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

            quantity: cartItem.quantity,
            price: unitPrice,

            settlement
        });

        shipment.subtotal += itemTotal;
    }


    const shipments = Array.from(
        shipmentMap.values()
    );


    // --------------------------------
    // Overall pricing
    // --------------------------------

    const deliveryFee = shipments.reduce(
        (sum, shipment) =>
            sum + shipment.shipping.deliveryFee,
        0
    );

    const totalCustomerPays = subtotal + deliveryFee;

    const payment = await createPaymentIntent({
        amount: totalCustomerPays,
        currency: "aed",
        buyerId
    });


    // --------------------------------
    // Create pending order
    // --------------------------------

    const order = await Order.create({
        buyerId,

        shipments,

        subtotal,

        deliveryFee,

        totalCustomerPays,

        platformFeesPercent: 20,

        platformFeesAmount: totalPlatformFees,

        // influencerCommissionAmount: totalInfluencerAmount,

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

        pricing: {
            subtotal,
            deliveryFee,
            totalCustomerPays
        },

        paymentStatus: order.paymentStatus
    };
};



// export const createPaymentService = async ({
//     amount,
//     currency
// }) => {

//     const paymentIntent = await stripe.paymentIntents.create({
//         amount,
//         currency
//     });

//     return {
//         paymentIntentId: paymentIntent.id,
//         clientSecret: paymentIntent.client_secret,
//         status: paymentIntent.status
//     };
// };