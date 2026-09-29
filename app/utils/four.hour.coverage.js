import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DOMParser } from "@xmldom/xmldom";
import { kml } from "@tmcw/togeojson";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Adjust this to wherever you actually place the exported file
const KML_PATH = path.join(__dirname, "..", "data", "quiqup-4hr-coverage.kml");

let cachedGeoJson = null;

const loadCoverageGeoJson = () => {
    if (cachedGeoJson) return cachedGeoJson;

    try {
        const kmlText = fs.readFileSync(KML_PATH, "utf8");
        const dom = new DOMParser().parseFromString(kmlText, "text/xml");
        cachedGeoJson = kml(dom);
    } catch (err) {
        console.warn(`4-hour coverage KML not found at ${KML_PATH} — treating all deliveries as outside coverage until it's added.`);
        cachedGeoJson = { features: [] };
    }

    return cachedGeoJson;
};

export const isWithinFourHourCoverage = (lat, lng) => {
    const geoJson = loadCoverageGeoJson();
    const testPoint = point([lng, lat]);

    return geoJson.features.some((feature) => {
        if (!feature.geometry) return false;
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
            try {
                return booleanPointInPolygon(testPoint, feature);
            } catch {
                return false;
            }
        }
        return false;
    });
};