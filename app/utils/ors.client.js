import AppError from "./AppError.js";

const ORS_MATRIX_URL = "https://api.openrouteservice.org/v2/matrix/driving-car";

/**
 * Returns driving distance in km from each pickup point to one delivery
 * point, in the same order as `pickups`. One ORS call handles an entire
 * order regardless of how many sellers/shipments it has.
 */
export const getDrivingDistancesKm = async (pickups, delivery) => {
    const locations = [
        ...pickups.map(p => [p.lng, p.lat]),
        [delivery.lng, delivery.lat]
    ];

    const destinationIndex = locations.length - 1;

    let response;
    try {
        response = await fetch(ORS_MATRIX_URL, {
            method: "POST",
            headers: {
                "Authorization": process.env.ORS_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                locations,
                sources: pickups.map((_, i) => i),
                destinations: [destinationIndex],
                metrics: ["distance"],
                units: "km"
            })
        });
    } catch (err) {
        throw new AppError("Could not reach the routing service. Please try again.", 502);
    }

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new AppError(`Distance lookup failed (${response.status}): ${body}`, 502);
    }

    const data = await response.json();
    return data.distances.map(row => row[0]);
};