import Category from "../models/category.model.js";
import Favourite from "../models/favourite.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ProductReview from "../models/product.review.model.js";
// import Review from "../models/product.review.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";


const createProduct = catchAsync(async (req, res, next) => {
    let { sellType, ownerId, ...rest } = req.body;


    if (req.user.role === "seller" && req.user.status !== "active") {
        return next(new AppError("Your seller account is not active. Contact support.", 403));
    }
    if (sellType === "self" || sellType === "sellForMe") {
        ownerId = req.user.id;
    } else if (sellType === "influencer") {
        if (!ownerId) {
            return next(new AppError("ownerId is required for influencer sale type", 400));
        }
        ownerId = ownerId;
    }

    const product = await Product.create({
        ...rest,
        sellType,
        ownerId,
        status: "pending"
    });


    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(product)
    });
});


// get all products by status
const getProductByStatus = catchAsync(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const products = await Product.find(filter);

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(products)
    });
});

const getSingleProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Prodcut Not found', 404))
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(product)
    });

});

const searchProdByFilter = catchAsync(async (req, res, next) => {
    const {
        brand,
        color,
        size,
        condition,
        location,
        minPrice,
        maxPrice,
        status,
        sellType,
        keyword,
        sortBy,
        page = 1,
        limit = 10,
    } = req.query;

    const filters = {};

    if (brand) filters.brand = { $in: brand.split(",") };
    if (color) filters.color = { $in: color.split(",") };
    if (size) filters.size = { $in: size.split(",") };
    if (condition) filters.condition = { $in: condition.split(",") };
    if (location) filters.location = { $in: location.split(",") };
    if (status) filters.status = status;
    if (sellType) filters.sellType = sellType;

    if (minPrice || maxPrice) {
        filters.salePrice = {};
        if (minPrice) filters.salePrice.$gte = Number(minPrice);
        if (maxPrice) filters.salePrice.$lte = Number(maxPrice);
    }

    if (keyword) {
        filters.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { brand: { $regex: keyword, $options: "i" } },
        ];
    }

    let sortOption = { createdAt: -1 };
    switch (sortBy) {
        case "newest":
            sortOption = { createdAt: -1 };
            break;
        case "priceHighToLow":
            sortOption = { salePrice: -1 };
            break;
        case "priceLowToHigh":
            sortOption = { salePrice: 1 };
            break;
        case "relevance":
        default:
            sortOption = { averageRating: -1, totalReviews: -1, createdAt: -1 };
            break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        Product.find(filters)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit)),
        Product.countDocuments(filters),
    ]);

    res.status(200).json({
        responseCode: "00",
        status: "success",
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        data: products,
    });
});


const getProductsByOwner = catchAsync(async (req, res, next) => {
    const filter = {};
    if (req.params.id) filter.ownerId = req.params.id;
    const products = await Product.find(filter);

    console.log("Products Be like", products)

    if (!products) {
        return next(new AppError('Prodcut Not found', 404))
    }


    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(products)
    });

});

const getProductsByCategory = catchAsync(async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const products = await Product.find({
        categoryId
    });

    if (!products) {
        return next(new AppError('Prodcut Not found', 404))
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(products)
    });

});



const updateProductData = async (req, res, next) => {
    const updated = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    if (!updated) {
        return next(new AppError('Prodcut Not found', 404))
    }

    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(updated)
    });
};


const updateProductStatus = async (req, res, next) => {
    const { status } = req.query;
    if (!status) {
        return next(new AppError('Status is required', 402))
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Prodcut Not found', 404))
    }

    console.log(product)
    product.status = status;

    const updated = await product.save();

    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(updated)
    });

};


// ========================
// DELETE PRODUCT
// ========================
const deleteProduct = catchAsync(async (req, res, next) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
        return next(new AppError('Prodcut Not found', 404))
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "The product deleted successfully"
    });
});


const addProductToFavourite = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    const buyerId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product Not found', 404))
    }

    const existingItem = await Favourite.findOne({ buyerId, productId });
    if (existingItem) {
        return next(new AppError("Product already In Cart", 402));
    }

    // Create cart item
    const fav = await Favourite.create({
        buyerId,
        productId
    });

    res.status(201).json({
        code: "00",
        successIndicator: "success",
        data: fav
    });
})


const getBuyerFavourites = catchAsync(async (req, res, next) => {
    const buyerId = req.params.buyerId;

    const items = await Favourite.find({ buyerId });
    if (!items) {
        return next(new AppError("No Favourite Items", 404));
    }

    res.status(200).json({
        code: "00",
        successIndicator: "success",
        data: items
    });
})

// const getSingleFavouriteItem = catchAsync(async (req, res, next) => {
//     const itemId = req.params.itemId;

//     const item = await Favourite.findById({ itemId });
//     if (!item) {
//         return next(new AppError("Item not Found", 404));
//     }

//     res.status(200).json({
//         code: "00",
//         successIndicator: "success",
//         data: item
//     });
// })


const removeItemFromFav = catchAsync(async (req, res, next) => {
    const itemId = req.params.itemId;

    const deleted = await Favourite.findByIdAndDelete(itemId);
    if (!deleted) {
        return next(new AppError("No Favourite Items", 404));
    }

    res.status(200).json({
        code: "00",
        successIndicator: "success",
        data: deleted
    });
})



const addReview = catchAsync(async (req, res, next) => {
    const productId = req.params.productId;
    const { orderId, rating, comment } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    const existingReview = await ProductReview.findOne({ productId, userId });

    if (existingReview) {
        return next(new AppError("You have already reviewed this product", 400));
    }

    const relevantOrder = await Order.findOne({ _id: orderId, buyerId: userId });


    if (!relevantOrder || relevantOrder?.status !== 'completed') {
        return next(new AppError("No Completed Order Found", 404));
    }


    await ProductReview.create({ productId, userId, rating, comment });

    const stats = await ProductReview.aggregate([
        { $match: { productId: product._id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);


    const averageRating = Math.round(stats[0]?.avgRating * 10) / 10;
    const totalReviews = stats[0]?.count;

    await Product.findByIdAndUpdate(productId, {
        averageRating,
        totalReviews
    });

    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: {
            averageRating,
            totalReviews
        }
    });
});

const getProductReviews = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const reviews = await ProductReview.find({ productId })
        .populate("userId", "name image")
        .sort({ createdAt: -1 });

    const product = await Product.findById(productId).select("averageRating totalReviews");
    if (!product) {
        return next(new AppError("Product not found", 404));
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        data: sanitizeResponse(reviews),
    });
});

const updateReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await ProductReview.findOne({ _id: req.params.reviewId, userId });
    if (!review) {
        return next(new AppError("Review not found", 404));
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    const stats = await ProductReview.aggregate([
        { $match: { productId: review.productId } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const averageRating = Math.round(stats[0].avgRating * 10) / 10;
    const totalReviews = stats[0].count;

    await Product.findByIdAndUpdate(review.productId, {
        averageRating,
        totalReviews,
    });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Review updated successfully",
    });
});

const deleteReview = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const review = await ProductReview.findOne({ _id: req.params.reviewId, userId });
    if (!review) {
        return next(new AppError("Review not found", 404));
    }

    const productId = review.productId;
    await review.deleteOne();

    const stats = await ProductReview.aggregate([
        { $match: { productId } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const averageRating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const totalReviews = stats.length ? stats[0].count : 0;


    await Product.findByIdAndUpdate(productId, {
        averageRating,
        totalReviews,
    });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        message: "Review deleted successfully",
    });
});



const createCategory = catchAsync(async (req, res, next) => {

    const { name, parentId } = req.body;

    let level = 1;

    if (parentId) {

        const parent = await Category.findById(parentId);

        if (!parent) {
            return next(new AppError("Parent category not found", 404));
        }

        level = parent.level + 1;
    }

    const exists = await Category.findOne({
        name,
        parentId: parentId || null
    });

    if (exists) {
        return next(
            new AppError("Category already exists", 400)
        );
    }

    const category = await Category.create({
        name,
        parentId: parentId || null,
        level
    });

    res.status(201).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(category),
    });
});


const getRootCategories = catchAsync(async (req, res) => {
    const { parentId } = req.query;

    console.log("Parrrrent Id", parentId)

    const filter = {
        isActive: true
    };

    if (parentId) {
        filter.parentId = parentId;
    } else {
        filter.parentId = null;
    }

    const categories = await Category.find(filter)
        .sort({ name: 1 });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(categories),
    });
});

const getChildCategories = catchAsync(async (req, res) => {

    const { parentId } = req.params;

    const categories = await Category.find({
        parentId,
        isActive: true
    });

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(categories),
    });

});

const getCategory = catchAsync(async (req, res, next) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(
            new AppError("Category not found", 404)
        );
    }

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(category),
    });

});

const updateCategory = catchAsync(async (req, res, next) => {

    const {
        name,
        isActive
    } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(
            new AppError("Category not found", 404)
        );
    }

    category.name = name;
    category.isActive = isActive;

    await category.save();

    res.status(200).json({
        responseCode: "00",
        status: "success",
        data: sanitizeResponse(category),
    });

});

export {
    createProduct,
    getProductByStatus,
    getSingleProduct,
    searchProdByFilter,
    getProductsByOwner,
    getProductsByCategory,
    updateProductData,
    updateProductStatus,
    deleteProduct,
    addProductToFavourite,
    getBuyerFavourites,
    removeItemFromFav,
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
    createCategory,
    getRootCategories,
    getChildCategories,
    getCategory,
    updateCategory
}
