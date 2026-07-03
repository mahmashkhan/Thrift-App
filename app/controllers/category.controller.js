import PreferenceOption from "../models/preferenceOption.model.js";
import {User} from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// ========== PUBLIC ==========

const getPreferenceOptions = catchAsync(async (req, res) => {
    const options = await PreferenceOption.find().sort({ type: 1, order: 1 });

    const grouped = {
        brands: [],
        sizes: [],
        styles: [],
    };

    options.forEach((opt) => {
        if (grouped[opt.type + "s"] !== undefined) {
            grouped[opt.type + "s"].push({
                category: opt.category,
                options: opt.options,
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

    const existing = await PreferenceOption.findOne({ type, category });
    if (existing) {
        return next(new AppError("This category already exists for this type", 400));
    }

    const option = await PreferenceOption.create({ type, category, options, order });

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
        { category, options, order },
        { new: true }
    );

    if (!updated) {
        return next(new AppError("Preference option not found", 404));
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: updated,
    });
});

const deletePreferenceOption = catchAsync(async (req, res, next) => {
    const deleted = await PreferenceOption.findByIdAndDelete(req.params.id);

    if (!deleted) {
        return next(new AppError("Preference option not found", 404));
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
    const { brands, sizes, styles } = req.body;

    const preferences = {};
    if (Array.isArray(brands)) preferences["preferences.brands"] = brands;
    if (Array.isArray(sizes)) preferences["preferences.sizes"] = sizes;
    if (Array.isArray(styles)) preferences["preferences.styles"] = styles;

    const updated = await User.findByIdAndUpdate(
        userId,
        { ...preferences, hasSetPreferences: true },
        { new: true }
    );

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Preferences saved successfully",
        data: {
            preferences: updated.preferences,
        },
    });
});

const skipPreferences = catchAsync(async (req, res) => {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
        "preferences.brands": [],
        "preferences.sizes": [],
        "preferences.styles": [],
        hasSetPreferences: true,
    });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Preferences skipped",
    });
});

const getMyPreferences = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id).select("preferences hasSetPreferences");

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
