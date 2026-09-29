// services/courierShipment.service.js
import Order from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { createQuiqupOrder } from "../utils/quiqup.client.js";


export const createCourierShipmentsForOrder = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) return;

    const buyer = await User.findById(order.buyerId).select("name phone");

    for (const shipment of order.shipments) {
        if (shipment.courier?.status === "CREATED") continue;

        shipment.courier = shipment.courier || {};
        shipment.courier.attempts = (shipment.courier.attempts || 0) + 1;
        shipment.courier.lastAttemptAt = new Date();

        try {
            const result = await createQuiqupOrder({
                shipment,
                order,
                buyerName: buyer?.name,
                buyerPhone: buyer?.phone
            });

            shipment.courier.shipmentId = String(result.quiqupOrderId);
            shipment.courier.trackingNumber = result.quiqupOrderUuid;
            shipment.courier.trackingUrl = result.trackingUrl;
            shipment.courier.status = "CREATED";

        } catch (err) {
            shipment.courier.status = "FAILED";
            shipment.courier.lastError = err.message;
            console.error(`Courier shipment failed — order ${order._id}, seller ${shipment.sellerId}:`, err.message);
        }
    }

    await order.save();
};


export const handleQuiqupEvent = async (event) => {
    if (event.type !== "order") return;

    const { payload } = event;
    if (!payload?.partner_order_id) {
        console.error("Quiqup webhook: missing partner_order_id in payload");
        return;
    }

    const [orderId, sellerId] = payload.partner_order_id.split("_");

    const order = await Order.findOne({ _id: orderId, "shipments.sellerId": sellerId });

    if (!order) {
        console.error("Quiqup webhook: no matching order/shipment for", payload.partner_order_id);
        return;
    }

    const shipment = order.shipments.find(s => s.sellerId.toString() === sellerId);
    if (!shipment) return;

    // Guard against an out-of-order webhook overwriting a newer state
    const incomingUpdatedAt = payload.state_updated_at ? new Date(payload.state_updated_at) : new Date();
    const currentUpdatedAt = shipment.courier?.quiqupStateUpdatedAt;

    if (currentUpdatedAt && incomingUpdatedAt <= currentUpdatedAt) {
        return;
    }

    shipment.courier = shipment.courier || {};
    shipment.courier.quiqupState = payload.state;
    shipment.courier.quiqupStateUpdatedAt = incomingUpdatedAt;
    shipment.courier.deliveryAttempts = payload.delivery_attempts ?? shipment.courier.deliveryAttempts;
    shipment.courier.deliveryFailureReason = payload.delivery_failure_reason ?? null;

    if (payload.tracking_url) {
        shipment.courier.trackingUrl = payload.tracking_url;
    }

    await order.save();

    // TODO: derive order-level Order.deliveryStatus from this once we know
    // Quiqup's full state list, and how a multi-seller order should
    // aggregate (e.g. is the order "delivered" only once every shipment is?)
};