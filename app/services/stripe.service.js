import cartModel from "../models/cart.model.js";
import Order from "../models/order.model.js";
import { createCourierShipmentsForOrder } from "./courier.service.js";


export const handleStripeEvent = async (event) => {

    if (event.type !== "payment_intent.succeeded" &&
        event.type !== "payment_intent.canceled") {
        return;
    }

    const paymentIntent = event.data.object;

    const order = await Order.findOne({
        stripePaymentIntentId: paymentIntent.id
    });

    if (!order) {
        console.error(
            "Order not found for PaymentIntent:",
            paymentIntent.id
        );
        return;
    }

    // Payment cancelled
    if (event.type === "payment_intent.canceled") {

        if (
            order.paymentStatus === "PAID" ||
            order.status === "cancelled"
        ) {
            return;
        }

        for (const shipment of order.shipments) {
            for (const item of shipment.items) {
                await Product.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        order.status = "cancelled";
        order.paymentStatus = "CANCELLED";

        await order.save();

        return;
    }

    // Payment succeeded
    if (event.type === "payment_intent.succeeded") {

        if (order.paymentStatus !== "PAID") {

            order.paymentStatus = "PAID";

            await order.save();

            await cartModel.deleteOne({
                buyerId: order.buyerId
            });
        }

        // Courier creation will be enabled later
        await createCourierShipmentsForOrder(order._id);
    }
};



