import Cart from "../models/cart.model.js"

export const createCartItem = async (bidData, buyerId, expiryInDays = 3) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryInDays);
    

    const cartItem = await Cart.create({
        productId: bidData.productId,
        sellerId: bidData.sellerId,
        quantity: bidData.itemQuantity,
        buyerId,
        bidId: bidData._id,
        price: bidData.priceOffered,
        // status: "reserved",
        expiresAt
    });

    return cartItem;
};
