import Bid from "../models/bid.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";
import Cart from "../models/cart.model.js"
import { User } from '../models/user.model.js';
import catchAsync from "../utils/catchAsync.js";
import { createCartItem } from "../utils/createCartItem.js";
import Order from "../models/order.model.js";
import { io } from "../server.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";
import { successResponse } from "../utils/common/responseObject.js";
import { createOrderService, prepareOrderService } from "../services/order.service.js";
import mongoose from "mongoose";


const createBid = catchAsync(async (req, res, next) => {
    const { productId, priceOffered, itemQuantity } = req.body;

    const product = await Product.findById(productId);

    console.log("PRODUCT MANAGED BY ID BE LIKE", product)

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
        assignedTo: product.managedById,
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


const withdrawBid = catchAsync(async (req, res, next) => {

    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);

    if (!bid) {
        return next(new AppError("Bid not found", 404));
    }

    // Only bidder can withdraw
    if (bid.buyerId.toString() !== req.user.id.toString()) {
        return next(new AppError("You are not authorized to withdraw this bid", 403));
    }

    // Only pending bids can be withdrawn
    if (bid.status !== "pending") {
        return next(
            new AppError(`Cannot withdraw a ${bid.status} bid`, 400)
        );
    }

    bid.status = "withdrawn";
    await bid.save();

    successResponse(res, 200, {
        message: "Bid withdrawn successfully."
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
    console.log("View Cart controller")
    const { buyerId } = req.params;

    const cart = await Cart.findOne({ buyerId })
        .populate({
            path: "items.productId",
            select: "title ownerId price imageUrls",
            populate: {
                path: "ownerId",
                select: "name"
            }
        })
        .populate({
            path: "items.bidId",
            select: "priceOffered"
        })
        .lean();


    const items = cart.items.map(item => {
        const product = item.productId;
        console.log("Product looks like", product);
        const bid = item.bidId;

        const productPrice = bid
            ? bid.priceOffered
            : product.price;

        return {
            productId: product._id,
            productName: product.title,
            productImages: product.imageUrls,

            sellerId: product.ownerId._id,
            sellerName: product.ownerId.name,

            bidId: bid?._id ?? null,

            productPrice,
            quantity: item.quantity,
            subtotal: productPrice * item.quantity
        };
    });

    const total = items.reduce(
        (sum, item) => sum + item.subtotal,
        0
    );


    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: {
            items: sanitizeResponse(items),
            total
        }
    });
});

export const prepareOrder = catchAsync(async (req, res, next) => {
    const buyerId = req.user.id;

    const invoice = await prepareOrderService(buyerId);

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: invoice
    });
});

// export const createPayment = catchAsync(async (req, res, next) => {

//     const { amount, currency } = req.body;

//     const payment = await createPaymentService({
//         amount,
//         currency
//     });

//     res.status(200).json({
//         responseCode: "00",
//         status: "success",
//         data: payment
//     });
// });

const checkOut = catchAsync(async (req, res, next) => {
    const buyerId = req.user.id;

    const result = await createOrderService(buyerId);

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: result
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




export {
    createBid,
    getProductBids,
    acceptBid,
    rejectBid,
    withdrawBid,
    addToCart,
    ViewCart,
    checkOut,
    getBuyerOrders,
    getOwnerOrders,
    getProductOrders
}


