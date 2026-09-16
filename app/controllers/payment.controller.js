import stripe from "../config/stripe.js";
import catchAsync from "../utils/catchAsync.js";


// Create PaymentIntent
const createPaymentIntent = catchAsync(async (req, res, next) => {

    const { amount, currency = "aed" } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({
            responseCode: "01",
            status: "failed",
            message: "Valid amount is required"
        });
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),

        // Optional metadata
        metadata: {
            userId: req.user?.id?.toString() || ""
        }
    });

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret
        }
    });
});


// Stripe webhook
const stripeWebhook = async (req, res) => {

    const signature = req.headers["stripe-signature"];

    let event;

    try {

        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

    } catch (error) {

        console.error("Stripe webhook signature error:", error.message);

        return res.status(400).send(
            `Webhook Error: ${error.message}`
        );
    }


    switch (event.type) {

        case "payment_intent.succeeded": {

            const paymentIntent = event.data.object;

            console.log(
                "PAYMENT SUCCESS:",
                paymentIntent.id
            );

            // Later:
            // update your Order here
            // call Quicup here
            // etc.

            break;
        }


        case "payment_intent.payment_failed": {

            const paymentIntent = event.data.object;

            console.log(
                "PAYMENT FAILED:",
                paymentIntent.id
            );

            break;
        }


        default:

            console.log(
                `Unhandled Stripe event: ${event.type}`
            );
    }


    return res.status(200).json({
        received: true
    });
};


export {
    createPaymentIntent,
    stripeWebhook
};