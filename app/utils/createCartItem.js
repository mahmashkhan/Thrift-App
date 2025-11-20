import Cart from "../models/cart.model.js"

export const createCartItem = async (bidData, buyerId, expiryInDays = 3) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryInDays);

    const cartItem = await Cart.create({
        productId: bidData.productId,
        sellerId: bidData.sellerId,
        buyerId,
        bidId: bidData._id,
        priceOffered: bidData.amount,
        status: "reserved",
        expiresAt
    });

    return cartItem;
};
