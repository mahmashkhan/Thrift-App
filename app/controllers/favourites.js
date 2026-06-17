// controllers/favourite.controller.js
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/common/responseObject.js';

// -----------------------------------------------
// PATCH /api/favourites/:productId  — toggle
// -----------------------------------------------
const toggleFavourite = catchAsync(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Check product exists
    const product = await Product.findById(productId);
    if (!product) {
        return errorResponse(res, 404, { message: 'Product not found' });
    }

    // 2. Check if already in favourites
    const user = await User.findById(userId);
    const isFavourite = user.favourites.includes(productId);

    if (isFavourite) {
        // ❌ Remove from favourites
        await User.updateOne(
            { _id: userId },
            { $pull: { favourites: productId } }
        );
        return successResponse(res, 200, { message: 'Removed from favourites' });
    } else {
        // ✅ Add to favourites
        await User.updateOne(
            { _id: userId },
            { $addToSet: { favourites: productId } }
        );
        return successResponse(res, 200, { message: 'Added to favourites' });
    }
});

// -----------------------------------------------
// GET /api/favourites — get all my favourites
// -----------------------------------------------
const getMyFavourites = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('favourites')   // gets full product details
        .select('favourites');

    successResponse(res, 200, {
        total: user.favourites.length,
        favourites: user.favourites
    });
});

// -----------------------------------------------
// GET /api/favourites/:productId — check if favourite
// -----------------------------------------------
const isFavourite = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).select('favourites');
    const exists = user.favourites.includes(req.params.productId);

    successResponse(res, 200, { isFavourite: exists });
});

export { toggleFavourite, getMyFavourites, isFavourite };