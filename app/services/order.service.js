import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Bid from "../models/bid.model.js";
import stripe from "../config/stripe.js";

export const prepareOrderService = async (buyerId) => {
    console.log("BuyerId", buyerId)
    const cart = await Cart.findOne({ buyerId }).lean();

    if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error("Cart is empty");
    }


    const productIds = cart.items.map(item => item.productId);

    console.log("productIds is here", productIds);


    const products = await Product.find({
        _id: { $in: productIds }
    }).lean();


    const productMap = new Map(
        products.map(product => [
            product._id.toString(),
            product
        ])
    );

    console.log("productMap is here", productMap);


    const bidIds = cart.items
        .filter(item => item.bidId)
        .map(item => item.bidId);


    console.log("bidIds is here", bidIds);

    const bids = bidIds.length
        ? await Bid.find({
            _id: { $in: bidIds },
            buyerId
        }).lean()
        : [];

    const bidMap = new Map(
        bids.map(bid => [
            bid._id.toString(),
            bid
        ])
    );

    const items = cart.items.map(cartItem => {
        const product = productMap.get(
            cartItem.productId.toString()
        );

        if (!product) {
            throw new Error(
                `Product not found: ${cartItem.productId}`
            );
        }

        if (product.status !== "approved") {
            throw new Error(
                `Product "${product.title}" is not available`
            );
        }

        if (cartItem.quantity > product.stock) {
            throw new Error(
                `Insufficient stock for product "${product.title}"`
            );
        }

        let unitPrice;
        let priceSource;

        if (cartItem.bidId) {
            const bid = bidMap.get(
                cartItem.bidId.toString()
            );

            if (!bid) {
                throw new Error(
                    `Bid not found: ${cartItem.bidId}`
                );
            }

            if (bid.productId.toString() !== product._id.toString()) {
                throw new Error(
                    `Bid does not belong to the selected product`
                );
            }

            if (bid.status !== "accepted") {
                throw new Error(
                    `Bid is not accepted for product "${product.title}"`
                );
            }

            unitPrice = bid.priceOffered;
            priceSource = "bid";
        } else {
            unitPrice = product.salePrice;
            priceSource = "product";
        }

        const itemTotal = unitPrice * cartItem.quantity;

        return {
            productId: product._id,
            bidId: cartItem.bidId || null,

            title: product.title,
            image: product.imageUrls?.[0] || null,

            sellerId: product.ownerId,

            quantity: cartItem.quantity,

            unitPrice,
            priceSource,

            total: itemTotal
        };
    });

    const subtotal = items.reduce(
        (total, item) => total + item.total,
        0
    );

    const deliveryCharges = 0;
    const discount = 0;

    const total = subtotal + deliveryCharges - discount;

    return {
        items,

        pricing: {
            subtotal,
            deliveryCharges,
            discount,
            total
        }
    };
};



export const createPaymentService = async ({
    amount,
    currency
}) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency
    });

    return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status
    };
};