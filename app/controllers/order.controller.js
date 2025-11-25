import Bid from "../models/bid.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";
import Cart from "../models/cart.model.js"
import User from '../models/user.model.js';
import catchAsync from "../utils/catchAsync.js";
import { createCartItem } from "../utils/createCartItem.js";
import Order from "../models/order.model.js";


const createBid = catchAsync(async (req, res, next) => {
    const { productId, priceOffered, itemQuantity } = req.body;

    const product = await Product.findById(productId);


    if (!product) {
        return next(new AppError('Product Not found', 404))
    }

    let assignedTo = null; 

    if (product.saleType === "self") {
        assignedTo = product.sellerId; // directly to seller
    } else {
        const admin = await User.findOne({ role: "admin" });
        const adminId = admin._id;

        assignedTo = adminId; // admin user ID
    }

    io.to(assignedTo.toString()).emit("Test", {
        message: "User called us",
    })

    await Bid.create({
        productId,
        buyerId: req?.user?.id,
        sellerId: product.ownerId,
        assignedTo,
        status: "pending",
        priceOffered,
        itemQuantity
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
    if (!bid) {

        return next(new AppError('No Bids found with bid id', 404))
    }
    let cartItem;

    console.log("This is the user", req?.user?.id);
    console.log("This is the Bid Assigned to", bid?.assignedTo);

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
    } else {
        return next(new AppError('You are not allowed to accept bid', 401))
    }

    res.status(201).json({
        code: "00",
        successIndicator: "success",
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
        await Bid.findByIdAndDelete(bidId);
        // bid.status = "rejected"
        // await bid.save();
    } else {
        return next(new AppError('You are not allowed to reject bid', 401))
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
        return next(new AppError("Product already In Cart", 402));
    }

    // expiry date logic
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    console.log("Product being logged", product);

    // Create cart item
    await Cart.create({
        buyerId,
        productId,
        bidId: null,
        expiresAt,
        // status: "reserved", 
        price: product?.price
    });

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: product
    });
});


const ViewCart = catchAsync(async (req, res, next) => {
    const { buyerId } = req.params;


    const cart = await Cart.find({ buyerId: buyerId })

    console.log("Cart Be Like", cart)

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: cart
    });
});

const checkOut = catchAsync(async (req, res, next) => {
    const buyerId = req.user.id;

    const cartItems = await Cart.find({ buyerId }).populate("productId");


    if (!cartItems.length) {
        return next(new AppError("Cart is empty", 404));
    }

    // 2. Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
        const product = await Product.findById(item.productId._id);

        console.log("Each Product Be like", product);

        if (!product) {
            return next(new AppError("Product not found", 404));
        }

        // If product quantity < item qty
        if (product.quantity < item.quantity) {
            return next(new AppError(`Insufficient quantity for product: ${product.title}`, 400));
        }

        // Deduct stock
        product.quantity -= item.quantity;

        if (product.quantity === 0) {
            product.status = "sold";
        }

        await product.save();

        totalAmount += item.productId.price * item.quantity;

        orderItems.push({
            productId: item.productId._id,
            price: item.productId.price,
            quantity: item.productId.quantity,
            productOwner: item.productId.ownerId,
            bidId: item.bidId || null
        });
    }

    const order = await Order.create({
        buyerId,
        items: orderItems,
        totalAmount,
        status: "pending"
    });

    // Remove from cart
    await Cart.deleteMany({ buyerId });

    res.status(201).json({
        code: "00",
        successIndicator: "success",
        data: order
    });

});


const getBuyerOrders = catchAsync(async (req, res, next) => {
    console.log("Buyer Orders be like", req.params.buyerId)

    const orders = await Order.find({ buyerId: req.params.buyerId })
        .populate("items.productId")
        .sort({ createdAt: -1 });


    res.status(200).json({ code: "00", successIndicator: "success", data: orders });

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

    res.status(200).json({
        code: "00",
        successIndicator: "success",
        count: orders.length,
        data: orders,
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

    res.status(200).json({
        code: "00",
        successIndicator: "success",
        count: orders.length,
        data: orders,
    });
};




export { createBid, getProductBids, acceptBid, rejectBid, addToCart, ViewCart, checkOut, getBuyerOrders, getOwnerOrders, getProductOrders }


 