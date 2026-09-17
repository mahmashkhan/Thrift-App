import express from "express";
import {
    getFilterOptions,
    getFilterOptionsAdmin,
    getFilterTypes,
    createFilterOption,
    updateFilterOption,
    deleteFilterOption,
} from "../controllers/filterOption.controller.js";
// Swap these for whatever your existing auth middleware is actually named
import { allowedUsers, optionalAuth } from "../middleware/authorizationMiddleware.js";

const router = express.Router();

// Public — used by both the buyer filter sidebar and the seller "add product" form
router.get("/", getFilterOptions);

// Admin only
router.get("/admin", allowedUsers(), getFilterOptionsAdmin);
router.get("/get-filter", allowedUsers(), getFilterTypes);
router.post("/create-filter", allowedUsers(), createFilterOption);
router.patch("/update-filter/:id", allowedUsers(), updateFilterOption);
router.delete("/delete-filter/:id", allowedUsers(), deleteFilterOption);

export default router;
