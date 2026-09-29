const STATE_GROUPS = {
    IN_PROGRESS: ["pending", "ready_for_collection", "out_for_collection", "on_hold"],
    COLLECTED: ["collected", "received_at_depot", "at_depot", "Transit", "out_for_delivery", "scheduled", "out_for_return"],
    DELIVERED: ["delivery_complete"],
    RETURNED: ["returned_to_origin"],
    RETURNING: ["return_to_origin"],
    FAILED: ["collection_failed", "delivery_failed"],
    CANCELLED: ["cancelled"]
};

export const mapQuiqupStateToDeliveryStatus = (quiqupState) => {
    for (const [group, states] of Object.entries(STATE_GROUPS)) {
        if (states.includes(quiqupState)) return group;
    }
    return "UNKNOWN"; // safer than silently guessing
};

// For a multi-seller order, several shipments can be in different states
// at once. This picks one order-level summary. TODO: confirm these exact
// string values exist in your Order.deliveryStatus enum, or tell me the
// real ones and I'll remap.
export const aggregateOrderDeliveryStatus = (shipments) => {
    const statuses = shipments.map(s => s.deliveryStatus);

    if (statuses.every(s => s === "DELIVERED")) return "DELIVERED";
    if (statuses.every(s => s === "CANCELLED")) return "CANCELLED";
    if (statuses.some(s => s === "FAILED")) return "PARTIALLY_FAILED";
    if (statuses.some(s => ["DELIVERED", "RETURNED", "CANCELLED"].includes(s))
        && statuses.some(s => !["DELIVERED", "RETURNED", "CANCELLED"].includes(s))) {
        return "PARTIALLY_DELIVERED";
    }
    return "IN_PROGRESS";
};