import catchAsync from "../utils/catchAsync.js";
import stripe from "../config/stripe.js";
import dotenv from "dotenv";
dotenv.config();

export const handleStripeWebhook = catchAsync(
    async (req, res) => {

        const signature = req.headers["stripe-signature"];

        let event;

        try {

            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );

        } catch (error) {

            console.error(
                "Stripe webhook signature verification failed:",
                error.message
            );

            return res.status(400).send(
                `Webhook Error: ${error.message}`
            );
        }

        console.log("Stripe webhook received:", event.type);

        if (event.type === "payment_intent.succeeded") {

            const paymentIntent = event.data.object;

            console.log(
                "Payment succeeded:",
                paymentIntent.id
            );

            console.log(
                "Amount:",
                paymentIntent.amount
            );

            console.log(
                "Currency:",
                paymentIntent.currency
            );

            console.log(
                "Status:",
                paymentIntent.status
            );
        }

        res.status(200).json({
            received: true
        });
    }
);