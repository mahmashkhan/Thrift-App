import Category from "../models/category.model.js";
import PreferenceOption from "../models/preferenceOption.model.js";
import { User } from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { successResponse } from "../utils/common/responseObject.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";

// ========== PUBLIC ==========

const getPreferenceOptions = catchAsync(async (req, res) => {
    const options = await PreferenceOption.find()
        .sort({ type: 1, order: 1 })
        .lean();

    const grouped = {
        brands: [],
        sizes: [],
        styles: [],
    };

    options.forEach((opt) => {
        if (opt.type === "brand") {
            grouped.brands.push({
                category: opt.category,
                options: opt.options || [],
            });
        }

        if (opt.type === "size") {
            grouped.sizes.push({
                category: opt.category,
                options: opt.options || [],
            });
        }

        if (opt.type === "style") {
            grouped.styles.push({
                category: opt.category,
                options: opt.options || [],
            });
        }
    });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: grouped,
    });
});

// ========== ADMIN ==========

const createPreferenceOption = catchAsync(async (req, res, next) => {
    const { type, category, options, order } = req.body;

    const existing = await PreferenceOption.findOne({
        type,
        category,
    });

    if (existing) {
        return next(
            new AppError(
                "This category already exists for this type",
                400
            )
        );
    }

    const option = await PreferenceOption.create({
        type,
        category,
        options,
        order,
    });

    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: option,
    });
});

const updatePreferenceOption = catchAsync(async (req, res, next) => {
    const { category, options, order } = req.body;

    const updated = await PreferenceOption.findByIdAndUpdate(
        req.params.id,
        {
            category,
            options,
            order,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updated) {
        return next(
            new AppError("Preference option not found", 404)
        );
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: updated,
    });
});

const deletePreferenceOption = catchAsync(async (req, res, next) => {
    const deleted = await PreferenceOption.findByIdAndDelete(
        req.params.id
    );

    if (!deleted) {
        return next(
            new AppError("Preference option not found", 404)
        );
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Preference option deleted successfully",
    });
});

// ========== USER PREFERENCES ==========

const setPreferences = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const {
        brands = [],
        categories = [],
        sizes = [],
        styles = [],
    } = req.body;

    // Validate category IDs only if categories are provided
    if (categories.length > 0) {
        const count = await Category.countDocuments({
            _id: { $in: categories },
        });

        if (count !== categories.length) {
            return next(
                new AppError(
                    "One or more categories are invalid.",
                    400
                )
            );
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            preferences: {
                brands,
                categories,
                sizes,
                styles,
            },
            hasSetPreferences: true,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("preferences hasSetPreferences");

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    successResponse(
        res,
        200,
        sanitizeResponse(user)
    );
});

const skipPreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
        userId,
        {
            "preferences.brands": [],
            "preferences.categories": [],
            "preferences.sizes": [],
            "preferences.styles": [],
            hasSetPreferences: true,
        },
        {
            new: true,
        }
    ).select("preferences hasSetPreferences");

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: {
            preferences: user.preferences,
            hasSetPreferences: user.hasSetPreferences,
        },
    });
});

const getMyPreferences = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .select("preferences hasSetPreferences")
        .lean();

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: {
            preferences: user.preferences,
            hasSetPreferences: user.hasSetPreferences,
        },
    });
});

export {
    getPreferenceOptions,
    createPreferenceOption,
    updatePreferenceOption,
    deletePreferenceOption,
    setPreferences,
    skipPreferences,
    getMyPreferences,
};

