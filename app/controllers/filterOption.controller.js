import FilterOption from "../models/filterOption.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";

// ========================
// PUBLIC: get active options, grouped by type (or a single type)
// Used by: buyer filter sidebar AND seller "add product" form
// GET /api/filter-options?type=brand   (optional)
// ========================
const getFilterOptions = catchAsync(async (req, res) => {
    const { type } = req.query;

    const filter = { isActive: true };
    if (type) filter.type = type.toLowerCase();

    const options = await FilterOption.find(filter).sort({ type: 1, sortOrder: 1, value: 1 });

    if (type) {
        // flat list for a single type
        return res.status(200).json({
            responseCode: "00",
            status: "success",
            data: sanitizeResponse(options),
        });
    }

    // group into { brand: [...], size: [...], color: [...], ... }
    const grouped = options.reduce((acc, opt) => {
        if (!acc[opt.type]) acc[opt.type] = [];
        acc[opt.type].push({
            _id: opt._id,
            value: opt.value,
            label: opt.label || opt.value,
        });
        return acc;
    }, {});

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: grouped,
    });
});

// ========================
// ADMIN: get everything, including inactive, for the admin panel
// GET /api/filter-options/admin?type=brand
// ========================
const getFilterOptionsAdmin = catchAsync(async (req, res) => {
    const { type } = req.query;

    const filter = {};
    if (type) filter.type = type.toLowerCase();

    const options = await FilterOption.find(filter).sort({ type: 1, sortOrder: 1, value: 1 });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(options),
    });
});

// ========================
// ADMIN: distinct list of attribute types currently in use
// GET /api/filter-options/types
// ========================
const getFilterTypes = catchAsync(async (req, res) => {
    const types = await FilterOption.distinct("type");

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: types,
    });
});

// ========================
// ADMIN: create a new option (new value under an existing type, or a brand new type)
// POST /api/filter-options  { type, value, label?, sortOrder? }
// ========================
const createFilterOption = catchAsync(async (req, res, next) => {
    const { type, value, label, sortOrder } = req.body;

    if (!type || !value) {
        return next(new AppError("type and value are required", 400));
    }

    const exists = await FilterOption.findOne({ type: type.toLowerCase(), value });
    if (exists) {
        return next(new AppError("This value already exists for this type", 400));
    }

    const option = await FilterOption.create({
        type: type.toLowerCase(),
        value,
        label,
        sortOrder,
    });

    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(option),
    });
});

// ========================
// ADMIN: update label / sortOrder / isActive on an option
// PATCH /api/filter-options/:id
// ========================
const updateFilterOption = catchAsync(async (req, res, next) => {
    const { label, sortOrder, isActive, value } = req.body;

    const option = await FilterOption.findById(req.params.id);
    if (!option) {
        return next(new AppError("Filter option not found", 404));
    }

    if (value !== undefined) option.value = value;
    if (label !== undefined) option.label = label;
    if (sortOrder !== undefined) option.sortOrder = sortOrder;
    if (isActive !== undefined) option.isActive = isActive;

    await option.save();

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(option),
    });
});

// ========================
// ADMIN: deactivate instead of hard-delete is usually safer (products may
// already reference this value), but a hard delete is exposed too.
// DELETE /api/filter-options/:id
// ========================
const deleteFilterOption = catchAsync(async (req, res, next) => {
    const deleted = await FilterOption.findByIdAndDelete(req.params.id);

    if (!deleted) {
        return next(new AppError("Filter option not found", 404));
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Filter option deleted successfully",
    });
});

// ========================
// Reusable validation helper — import this in product.controller.js
// Checks that a value submitted by a seller is an active, admin-approved
// option for that attribute type.
// ========================
const isValidAttributeValue = async (type, value) => {
    if (value === undefined || value === null || value === "") return true; // optional fields skip validation
    const found = await FilterOption.findOne({ type, value, isActive: true });
    return !!found;
};

export {
    getFilterOptions,
    getFilterOptionsAdmin,
    getFilterTypes,
    createFilterOption,
    updateFilterOption,
    deleteFilterOption,
    isValidAttributeValue,
};
