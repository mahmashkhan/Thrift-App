import { Seller } from "../models/user.model.js";
import { User } from "../models/user.model.js";
import CourierConfig from "../models/courier.config.model.js";
import AppError from "./AppError.js";
import { getDrivingDistancesKm } from "./ors.client.js";
import { isWithinFourHourCoverage } from "./four.hour.coverage.js";

const round = (n) => Math.round(n * 100) / 100;

const calculateDeliveryFee = (courierConfig, distanceKm) => {
    let base;

    if (distanceKm <= courierConfig.radiusKm) {
        base = courierConfig.baseFee;
    } else {
        const { feeType, flatFee, perKmRate } = courierConfig.beyondRadius || {};

        if (feeType === "per_km" && perKmRate != null) {
            const extraKm = distanceKm - courierConfig.radiusKm;
            base = courierConfig.baseFee + extraKm * perKmRate;
        } else if (feeType === "flat" && flatFee != null) {
            base = flatFee;
        } else if (feeType === "not_serviced") {
            throw new AppError(
                `This delivery is ${round(distanceKm)}km away, which is outside Quiqup's serviceable range.`,
                400
            );
        } else {
            throw new AppError(
                "Delivery pricing beyond the standard radius hasn't been configured yet. Please contact support.",
                500
            );
        }
    }

    const fuelSurchargeAmount = base * (courierConfig.fuelSurchargePercent / 100);
    const beforeVat = base + fuelSurchargeAmount;
    const vatAmount = beforeVat * (courierConfig.vatPercent / 100);
    const total = beforeVat + vatAmount;

    return {
        total: round(total),
        breakdown: {
            baseFee: round(base),
            distanceKm: round(distanceKm),
            withinRadius: distanceKm <= courierConfig.radiusKm,
            fuelSurchargePercent: courierConfig.fuelSurchargePercent,
            fuelSurchargeAmount: round(fuelSurchargeAmount),
            vatPercent: courierConfig.vatPercent,
            vatAmount: round(vatAmount),
            total: round(total)
        }
    };
};

export const applyShippingDetails = async (buyerId, shipments) => {
    const sellerIds = shipments.map((s) => s.sellerId);

    const [sellers, buyer, courierConfig] = await Promise.all([
        Seller.find({ userId: { $in: sellerIds } })
            .select("userId addressLine1 location coordinates")
            .lean(),
        User.findById(buyerId).select("addresses").lean(),
        CourierConfig.findOne().lean()
    ]);

    if (!courierConfig) {
        throw new AppError("Delivery pricing is not configured", 500);
    }

    const deliveryLocation = buyer?.addresses?.[0];

    if (!deliveryLocation) {
        throw new AppError("Please add a delivery address before checkout", 400);
    }

    if (deliveryLocation.coordinates?.lat == null || deliveryLocation.coordinates?.lng == null) {
        throw new AppError(
            "Your saved address is missing location coordinates. Please re-save it using the map picker.",
            400
        );
    }

    const pickupBySeller = new Map(
        sellers.map((s) => [
            s.userId.toString(),
            { addressLine1: s.addressLine1, location: s.location, coordinates: s.coordinates }
        ])
    );

    for (const shipment of shipments) {

        

        const pickup = pickupBySeller.get(shipment.sellerId.toString());

        if (!pickup?.addressLine1 || !pickup?.location) {
            throw new AppError(`Pickup address not available for seller "${shipment.sellerName}"`, 400);
        }

        if (pickup.coordinates?.lat == null || pickup.coordinates?.lng == null) {
            throw new AppError(
                `Seller "${shipment.sellerName}" hasn't set their pickup location coordinates yet`,
                400
            );
        }
    }

    // One ORS call for the whole order, however many sellers it spans
    const pickupCoords = shipments.map((s) => pickupBySeller.get(s.sellerId.toString()).coordinates);
    const distances = await getDrivingDistancesKm(pickupCoords, deliveryLocation.coordinates);

    const fourHourEligible = isWithinFourHourCoverage(
        deliveryLocation.coordinates.lat,
        deliveryLocation.coordinates.lng
    );

    shipments.forEach((shipment, i) => {
        const pickup = pickupBySeller.get(shipment.sellerId.toString());
        const { total, breakdown } = calculateDeliveryFee(courierConfig, distances[i]);

        shipment.shipping.pickupLocation = {
            addressLine1: pickup.addressLine1,
            location: pickup.location,
            coordinates: pickup.coordinates
        };
        shipment.shipping.deliveryLocation = deliveryLocation;
        shipment.shipping.deliveryFee = total;
        shipment.shipping.deliveryFeeBreakdown = breakdown;
        shipment.shipping.fourHourEligible = fourHourEligible;
    });

    return shipments;
};