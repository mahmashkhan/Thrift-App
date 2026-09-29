const QUIQUP_BASE_URL = "https://api.staging.quiqup.com"; // swap to production at launch

const buildAddressPayload = ({ contactName, contactPhone, address }) => ({
    contact_name: contactName,
    contact_phone: contactPhone,
    address: {
        address1: address.addressLine1,
        address2: address.addressLine2 || undefined,
        coords: [address.coordinates.lng, address.coordinates.lat],
        country: "AE",
        town: address.city
    }
});

// Each unit of quantity becomes its own parcel entry, quantity always 1
const buildQuiqupItems = (shipment) => {
    const totalParcels = shipment.items.reduce((sum, item) => sum + item.quantity, 0);

    const parcels = [];
    let parcelIndex = 0;

    for (const item of shipment.items) {
        for (let i = 0; i < item.quantity; i++) {
            parcelIndex += 1;
            parcels.push({
                name: totalParcels > 1
                    ? `${item.title} — Parcel ${parcelIndex} of ${totalParcels}`
                    : item.title,
                quantity: 1
                // parcel_barcode intentionally omitted - Quiqup generates it
                // and the matching label, since we don't have our own labels
            });
        }
    }

    return parcels;
};

export const createQuiqupOrder = async ({ shipment, order, buyerName, buyerPhone }) => {


    const payload = {
        kind: "partner_4hr",
        notes: null,

        payment_mode: "pre_paid",
        payment_amount: 0,
        // billing_identifier intentionally omitted - that's for multi-business
        // reseller integrations, which doesn't apply to us

        scheduled_for: null,
        metadata: { orderId: order._id.toString(), sellerId: shipment.sellerId.toString() },
        partner_order_id: `${order._id}_${shipment.sellerId}`,

        required_documents: [], // TODO: still unconfirmed - see to-do list



        origin: buildAddressPayload({
            contactName: shipment.sellerName,
            contactPhone: shipment.sellerPhone,
            address: {
                addressLine1: shipment.shipping.pickupLocation.addressLine1,
                city: shipment.shipping.pickupLocation.location,
                coordinates: shipment.shipping.pickupLocation.coordinates
            }
        }),

        destination: buildAddressPayload({
            contactName: buyerName,
            contactPhone: buyerPhone,
            address: {
                addressLine1: shipment.shipping.deliveryLocation.addressLine1,
                addressLine2: shipment.shipping.deliveryLocation.addressLine2,
                city: shipment.shipping.deliveryLocation.city,
                coordinates: shipment.shipping.deliveryLocation.coordinates
            }
        }),

        items: buildQuiqupItems(shipment)
    };

    const response = await fetch(`${QUIQUP_BASE_URL}/orders`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${process.env.QUIQUP_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Quiqup order creation failed (${response.status}): ${JSON.stringify(data)}`);
    }

    return {
        quiqupOrderId: data.order.id,
        quiqupOrderUuid: data.order.uuid,
        trackingUrl: data.order.tracking_url,
        state: data.order.state
    };
};