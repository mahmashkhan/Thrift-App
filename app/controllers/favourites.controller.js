// controllers/favourite.controller.js
import {User} from '../models/user.model.js';
import Product from '../models/product.model.js';
import catchAsync from '../utils/catchAsync.js';
import { successResponse, errorResponse } from '../utils/common/responseObject.js';

// toggle favourite products
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
        return successResponse(res, 200, { message: 'Added to favourites successfully' });
    }
});


const getMyFavourites = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('favourites')   // gets full product details
        .select('favourites');

    successResponse(res, 200, {
        total: user.favourites.length,
        favourites: user.favourites
    });
});


export { toggleFavourite, getMyFavourites };