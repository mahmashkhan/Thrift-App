import stripe from "../../config/stripe.js";

const createPaymentIntent = async ({
    amount,
    orderId,
    buyerId
}) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "aed",

        metadata: {
            orderId: orderId.toString(),
            buyerId: buyerId.toString()
        }
    });

    return paymentIntent;
};


const createSellerTransfer = async ({
    amount,
    sellerStripeAccountId,
    orderId,
    itemId
}) => {

    const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: "aed",
        destination: sellerStripeAccountId,

        metadata: {
            orderId: orderId.toString(),
            itemId: itemId.toString()
        }
    });

    return transfer;
};


const refundPayment = async ({
    paymentIntentId,
    amount = null
}) => {

    const refundData = {
        payment_intent: paymentIntentId
    };

    if (amount) {
        refundData.amount = Math.round(amount * 100);
    }

    return await stripe.refunds.create(refundData);
};


export {
    createPaymentIntent,
    createSellerTransfer,
    refundPayment
};