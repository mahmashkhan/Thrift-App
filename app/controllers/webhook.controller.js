import catchAsync from "../utils/catchAsync.js";
import stripe from "../config/stripe.js";
import dotenv from "dotenv";
import { handleStripeEvent } from "../services/stripe.service.js";
dotenv.config();

export const handleStripeWebhook = catchAsync(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.error("Stripe webhook signature verification failed:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Acknowledge Stripe immediately — it won't retry this once we return 2xx,
    // so anything slow (courier calls) must happen after this line, not before it.
    res.status(200).json({ received: true });

    handleStripeEvent(event).catch((err) => {
        console.error("Error processing Stripe event:", event.id, err);
        // TODO: alert an admin — payment succeeded but our processing failed
    });
});