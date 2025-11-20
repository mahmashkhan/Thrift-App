import Bid from "../models/bid.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";
import Cart from "../models/cart.model.js"
import User from '../models/user.model.js';
import catchAsync from "../utils/catchAsync.js";
import { createCartItem } from "../utils/createCartItem.js";
import Order from "../models/order.model.js";


const createBid = catchAsync(async (req, res) => {
    const { productId, bidAmount } = req.body;

    const product = await Product.findById(productId);

    // console.log("Fetching this Product", product)

    if (!product) {
        return next(new AppError('Prodcut Not found', 404))
    }

    let assignedTo = null;

    if (product.saleType === "self") {
        assignedTo = product.sellerId; // directly to seller
    } else {
        const admin = await User.findOne({ role: "admin" });
        const adminId = admin._id;

        assignedTo = adminId; // admin user ID
    }

    await Bid.create({
        productId,
        buyerId: req?.user?.id,
        sellerId: product.ownerId,
        assignedTo,
        status: "pending",
        bidAmount
    });


    res.status(201).json({
        code: "00",
        successIndicator: "success",
        data: product
    });
});


const getProductBids = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const bids = await Bid.find({ productId })

    res.status(200).json({
        status: "00",
        message: "success",
        data: bids
    });
});


const acceptBid = catchAsync(async (req, res, next) => {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)
    let cartItem;

    console.log("This is the user", req?.user?.id);
    console.log("This is the Bid", bid?.assignedTo);

    if (bid?.assignedTo === req?.user?.id) {
        bid.status = "accepted"
        await bid.save();

        cartItem = await createCartItem(bid, req.user.id);
    } else {
        return next(new AppError('You are not allowed to accept bid', 401))
    }

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: {
            cart: cartItem
        }
    });
});



const rejectBid = catchAsync(async (req, res, next) => {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)

    console.log("This is the user", req?.user?.id);
    console.log("This is the Bid", bid?.assignedTo);

    if (bid?.assignedTo === req?.user?.id) {
        bid.status = "rejected"
        await bid.save();
    } else {
        return next(new AppError('You are not allowed to accept bid', 401))
    }

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: bid
    });

    res.status(201).json({
        code: "00",
        successIndicator: true,
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

    // Check if already in cart
    const existingItem = await Cart.findOne({ buyerId, productId, status: "reserved" });
    if (existingItem) {
        return res.status(200).json({
            message: "Product already in cart",
            data: existingItem
        });
    }

    // expiry date logic
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    // Create cart item
    const cartItem = await Cart.create({
        buyerId,
        productId,
        bidId: null,
        expiresAt,
        status: "reserved"
    });

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: product
    });
});


const ViewCart = catchAsync(async (req, res) => {
    const { buyerId } = req.params;


    const cart = await Cart.find({ buyerId: buyerId })

    console.log("Cart Be Like", cart)

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: cart
    });
});

const checkOut = catchAsync(async (req, res) => {
    const buyerId = req.user.id;

    const cartItems = await Cart.find({ buyerId, status: "reserved" }).populate("productId");

    if (!cartItems.length) {
        return next(new AppError("Cart is empty", 404));
    }

    // 2. Calculate total amount
    let totalAmount = 0;

    const orderItems = cartItems.map(item => {
        totalAmount += item.productId.price;
        return {
            productId: item.productId._id,
            price: item.productId.price,
            bidId: item.bidId || null
        };
    });

    const order = await Order.create({
        buyerId,
        items: orderItems,
        totalAmount,
        status: "pending"
    });

    await Cart.deleteMany({ buyerId, status: "reserved" });

    //    // 5. (Optional) notify admin/seller based on saleType
    // cartItems.forEach(item => {
    //     if (item.productId.saleType === "self") {
    //         console.log("Notify seller:", item.productId.sellerId);
    //     } else {
    //         console.log("Notify admin for influencer/sellForMe process");
    //     }
    // });

    res.status(201).json({
        code: "00",
        successIndicator: true,
        message: "Checkout successful",
        order
    });

});




export { createBid, getProductBids, acceptBid, rejectBid, addToCart, ViewCart, checkOut }


