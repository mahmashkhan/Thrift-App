import Bid from "../models/bid.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";
import Cart from "../models/cart.model.js"
import User from '../models/user.model.js';
import catchAsync from "../utils/catchAsync.js";
import { createCartItem } from "../utils/createCartItem.js";
import Order from "../models/order.model.js";
import { io } from "../server.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";


const createBid = catchAsync(async (req, res, next) => {
    const { productId, priceOffered, itemQuantity, managedById } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
        return next(new AppError('Product Not found', 404))
    }

    if (product.ownerId.toString() === req.user.id.toString()) {
        return next(new AppError('You cannot bid on your own product', 400));
    }

    const bid = await Bid.create({
        productId,
        buyerId: req?.user?.id,
        sellerId: product.ownerId,
        assignedTo: managedById,
        status: "pending",
        priceOffered,
        itemQuantity
    });

    // io.to(managedById.toString()).emit("newBid", {
    //     message: "New bid received ===========>>> ",
    //     bidId: bid._id,
    //     productId,
    //     buyerId: req.user.id,
    //     priceOffered
    // });


    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(bid)
    });
});


const getProductBids = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const bids = await Bid.find({ productId })

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(bids)
    });
});


const acceptBid = catchAsync(async (req, res, next) => {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)

    if (!bid) {
        return next(new AppError('No Bids found with bid id', 404))
    }
    let cartItem;

    const buyerId = bid?.buyerId;
    const productId = bid?.productId;


    const existingItem = await Cart.findOne({ buyerId, productId });

    if (existingItem) {
        return next(new AppError("Product already In Cart", 402));
    }

    if (bid?.assignedTo.toString() === req?.user?.id) {
        bid.status = "accepted",
            await bid.save();
        cartItem = await createCartItem(bid, req.user.id);


        // console.log("Buyer Id", buyerId.toString())
        // io.to(buyerId.toString()).emit("bidAccepted", {
        //     message: "Bid Accepted",
        //     bidId,
        //     productId,
        //     priceOffered: bid.priceOffered,
        // });
        await Bid.findByIdAndDelete(bidId);   //remove bid

    } else {
        return next(new AppError('You are not allowed to accept bid', 401))
    }

    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(cartItem)
    });
});



const rejectBid = catchAsync(async (req, res, next) => {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)

    if (!bid) {
        return next(new AppError('No Bids found with bid id', 404))
    }


    if (bid?.assignedTo.toString() === req?.user?.id) {
        await Bid.findByIdAndDelete(bidId);

        // io.to(bid?.buyerId.toString()).emit("bidRejected", {
        //     message: "Bid Rejected",
        //     bidId,
        //     productId: bid?.productId,
        //     priceOffered: bid.priceOffered,
        // });
        // bid.status = "rejected"
        // await bid.save();
    } else {
        return next(new AppError('You are not allowed to reject bid', 401))
    }

    res.status(201).json({
        responseCode: "00",
        status: "success",
        message: "Bid Rejected Successfully"
    });
});


const addToCart = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    const buyerId = req.user.id;

    // Check product exists
    const product = await Product.findById(productId);

    if (!product || product.status !== "approved") {
        return next(new AppError("Product not available", 404));
    }

    // Find user's cart
    let cart = await Cart.findOne({ buyerId });

    // Create cart if it doesn't exist
    if (!cart) {
        cart = await Cart.create({
            buyerId,
            items: [
                {
                    productId,
                    bidId: null,
                    price: product.price,
                    quantity: 1
                }
            ]
        });
    } else {
        // Check if product already exists in cart
        const existingItem = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + 1 > product.stock) {
                return next(
                    new AppError(`Only ${product.stock} item(s) available in stock`, 400)
                );
            }
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                productId,
                bidId: null,
                price: product.price,
                quantity: 1
            });
        }

        await cart.save();
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(cart)
    });
});


const ViewCart = catchAsync(async (req, res, next) => {
    const { buyerId } = req.params;

    const cart = await Cart.findOne({ buyerId: buyerId })

    // console.log("Cart Be Like", cart)

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(cart)
    });
});

const checkOut = catchAsync(async (req, res, next) => {

    const buyerId = req.user.id;

    const cart = await Cart.findOne({ buyerId })
        .populate("items.productId");

    if (!cart || !cart.items.length) {
        return next(new AppError("Cart is empty", 404));
    }

    let subtotal = 0;

    let totalPlatformCommission = 0;

    let totalSellerAmount = 0;

    let totalInfluencerAmount = 0;

    const orderItems = [];

    for (const item of cart.items) {

        const product = item.productId;

        if (!product) {
            return next(
                new AppError("Product not found", 404)
            );
        }

        // Stock validation
        if (product.stock < item.quantity) {
            return next(
                new AppError(
                    `Insufficient stock for ${product.title}`,
                    400
                )
            );
        }

        const settlement =
            orderSettlement({
                product,
                quantity: item.quantity
            });

        subtotal += settlement.productAmount;

        totalPlatformCommission +=
            settlement.platformCommission;

        totalSellerAmount +=
            settlement.sellerAmount;

        totalInfluencerAmount +=
            settlement.influencerAmount;

        orderItems.push({
            productId: product._id,

            sellerId:
                settlement.productType === "influencer"
                    ? null
                    : product.ownerId,

            managedBy: product.managedBy,

            managedById: product.managedById,

            sellType: product.sellType,

            quantity: item.quantity,

            unitPrice: product.price,

            bidId: item.bidId,

            settlement
        });
    }

    const summary = {
        subtotal,

        totalPlatformCommission,

        totalSellerAmount,

        totalInfluencerAmount,

        totalPayable: subtotal
    };

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: {
            items: orderItems,
            summary
        }
    });
});


const getBuyerOrders = catchAsync(async (req, res, next) => {
    console.log("Buyer Orders be like", req.params.buyerId)

    const orders = await Order.find({ buyerId: req.params.buyerId })
        .populate("items.productId")
        .sort({ createdAt: -1 });


    res.status(200)
        .json({
            responseCode: "00",
            status: "success",
            data: sanitizeResponse(orders)
        });

})

const getOwnerOrders = catchAsync(async (req, res, next) => {
    const { ownerId } = req.params;

    if (!ownerId) {
        return next(new AppError("Onwer ID is required", 400));
    }

    const orders = await Order.find({ "items.productOwner": ownerId })
        // .populate("buyerId", "name email")   // optional
        // .populate("items.productId", "name price images") // optional
        .sort({ createdAt: -1 });

    if (!orders.length) {
        return next(new AppError("No orders found for this product", 404));
    }

    const filteredOrders = orders.map(order => ({
        ...order.toObject(),
        items: order.items.filter(
            item => item.productOwner.toString() === ownerId
        )
    }));

    res.status(200).json({
        responseCode: "00",
        status: "success",
        // count: filteredOrders.length,
        data: sanitizeResponse(filteredOrders),
    });
})


const getProductOrders = async (req, res, next) => {
    const { productId } = req.params;

    if (!productId) {
        return next(new AppError("Product ID is required", 400));
    }

    const orders = await Order.find({ "items.productId": productId })
        // .populate("buyerId", "name email")   // optional
        // .populate("items.productId", "name price images") // optional
        .sort({ createdAt: -1 });

    if (!orders.length) {
        return next(new AppError("No orders found for this product", 404));
    }

    const filteredOrders = orders.map(order => ({
        ...order.toObject(),
        items: order.items.filter(
            item => item.productId.toString() === productId
        )
    }));

    res.status(200).json({
        responseCode: "00",
        status: "success",
        // count: filteredOrders?.length,
        data: sanitizeResponse(filteredOrders),
    });
};




export { createBid, getProductBids, acceptBid, rejectBid, addToCart, ViewCart, checkOut, getBuyerOrders, getOwnerOrders, getProductOrders }


