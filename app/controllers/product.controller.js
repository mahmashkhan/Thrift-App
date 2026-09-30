import Category from "../models/category.model.js";
import Favourite from "../models/favourite.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ProductReview from "../models/product.review.model.js";
import { User } from "../models/user.model.js";
// import Review from "../models/product.review.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { sanitizeResponse } from "../utils/common/sanitizeResponse.js";

const createProduct = catchAsync(async (req, res, next) => {
  let { sellType, ownerId, ...rest } = req.body;

  if (req.user.role === "seller" && req.user.status !== "active") {
    return next(
      new AppError("Your seller account is not active. Contact support.", 403),
    );
  }
  if (sellType === "self" || sellType === "sellForMe") {
    ownerId = req.user.id;
  } else if (sellType === "influencer") {
    if (!ownerId) {
      return next(
        new AppError("ownerId is required for influencer sale type", 400),
      );
    }
    ownerId = ownerId;
  }

  const product = await Product.create({
    ...rest,
    sellType,
    ownerId,
    status: "pending",
  });

  res.status(201).json({
    responseCode: "00",
    status: "success",
    data: sanitizeResponse(product),
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
    data: sanitizeResponse(products),
  });
});

const getSingleProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Prodcut Not found", 404));
  }

  res.status(200).json({
    responseCode: "00",
    status: "success",
    data: sanitizeResponse(product),
  });
});

// const searchProdByFilter = catchAsync(async (req, res, next) => {
//     const {
//         keyword,
//         categoryId,
//         categoryName,
//         brand,
//         color,
//         size,
//         condition,
//         location,
//         minPrice,
//         maxPrice,
//         status,
//         sellType,
//         sortBy,
//         page = 1,
//         limit = 10,
//     } = req.query;

//     const filters = { status: "approved" };

//     if (keyword) {
//         filters.$or = [
//             { title: { $regex: keyword, $options: "i" } },
//             { description: { $regex: keyword, $options: "i" } },
//             { brand: { $regex: keyword, $options: "i" } },
//             { details: { $regex: keyword, $options: "i" } },
//             { color: { $regex: keyword, $options: "i" } },
//             { size: { $regex: keyword, $options: "i" } },
//             { condition: { $regex: keyword, $options: "i" } },
//             { location: { $regex: keyword, $options: "i" } },
//         ];
//     }

//     // filter by category ID directly
//     if (categoryId) {
//         filters.categoryId = categoryId;
//     } else if (categoryName) {
//         // filter by category name — look up the category first
//         const category = await Category.findOne({
//             name: { $regex: categoryName, $options: "i" },
//             isActive: true,
//         });
//         if (!category) {
//             return res.status(200).json({
//                 responseCode: "00",
//                 status: "success",
//                 page: Number(page),
//                 limit: Number(limit),
//                 total: 0,
//                 totalPages: 0,
//                 data: [],
//             });
//         }
//         filters.categoryId = category._id;
//     }

//     // single-value or comma-separated filters
//     if (brand) filters.brand = { $in: brand.split(",").map(v => v.trim()) };
//     if (color) filters.color = { $in: color.split(",").map(v => v.trim()) };
//     if (size) filters.size = { $in: size.split(",").map(v => v.trim()) };
//     if (condition) filters.condition = { $in: condition.split(",").map(v => v.trim()) };
//     if (location) filters.location = { $in: location.split(",").map(v => v.trim()) };
//     if (sellType) filters.sellType = sellType;

//     // admin can override status filter
//     if (status) filters.status = status;

//     const min = Number(minPrice);
//     const max = Number(maxPrice);
//     if (!isNaN(min) && minPrice !== undefined && minPrice !== "") filters["salePrice"] = { ...filters["salePrice"], $gte: min };
//     if (!isNaN(max) && maxPrice !== undefined && maxPrice !== "") filters["salePrice"] = { ...filters["salePrice"], $lte: max };

//     const sortMap = {
//         newest: { createdAt: -1 },
//         priceHighToLow: { salePrice: -1 },
//         priceLowToHigh: { salePrice: 1 },
//         topRated: { averageRating: -1, totalReviews: -1 },
//     };
//     const sortOption = sortMap[sortBy] ?? { createdAt: -1 };

//     const skip = (Number(page) - 1) * Number(limit);

//     const [products, total] = await Promise.all([
//         Product.find(filters)
//             .populate("categoryId", "name parentId isActive")
//             .populate("ownerId", "name image")
//             .sort(sortOption)
//             .skip(skip)
//             .limit(Number(limit)),
//         Product.countDocuments(filters),
//     ]);

//     res.status(200).json({
//         responseCode: "00",
//         status: "success",
//         page: Number(page),
//         limit: Number(limit),
//         total,
//         totalPages: Math.ceil(total / Number(limit)),
//         data: products,
//     });
// });

const searchProdByFilter = catchAsync(async (req, res, next) => {
  const {
    keyword,
    categoryId,
    categoryName,
    brand,
    color,
    size,
    condition,
    location,
    minPrice,
    maxPrice,
    status,
    sellType,
    managedBy,
    sortBy,
    page = 1,
    limit = 10,
  } = req.query;

  const filters = {
    status: "approved",
  };

  // =========================
  // KEYWORD SEARCH
  // =========================
  if (keyword && keyword.trim() !== "") {
    const searchRegex = {
      $regex: keyword.trim(),
      $options: "i",
    };

    filters.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { details: searchRegex },
      { color: searchRegex },
      { location: searchRegex },
    ];
  }

  // =========================
  // CATEGORY
  // =========================
  if (categoryId) {
    filters.categoryId = categoryId;
  } else if (categoryName) {
    const category = await Category.findOne({
      name: {
        $regex: categoryName.trim(),
        $options: "i",
      },
      isActive: true,
    });

    if (!category) {
      return res.status(200).json({
        responseCode: "00",
        status: "success",
        page: Number(page),
        limit: Number(limit),
        total: 0,
        totalPages: 0,
        data: [],
      });
    }

    filters.categoryId = category._id;
  }

  // =========================
  // MULTI-VALUE FILTERS
  // =========================

  // Example:
  // ?brand=Nike,Adidas
  if (brand) {
    filters.brand = {
      $in: brand
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  // Example:
  // ?color=Black,White,Blue
  if (color) {
    filters.color = {
      $in: color
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  // Example:
  // ?size=M,L,XL
  if (size) {
    filters.size = {
      $in: size
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  // Example:
  // ?condition=New,Used
  if (condition) {
    filters.condition = {
      $in: condition
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  // Example:
  // ?location=Karachi,Lahore
  if (location) {
    filters.location = {
      $in: location
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  // =========================
  // SELL TYPE
  // =========================
  if (sellType) {
    filters.sellType = {
      $in: sellType
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  // =========================
  // MANAGED BY
  // =========================
  if (managedBy) {
    filters.managedBy = {
      $in: managedBy
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  // =========================
  // STATUS
  // =========================
  // Only allow status override if you really need
  // admin to search other statuses.
  if (status) {
    filters.status = {
      $in: status
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  // =========================
  // SALE PRICE FILTER
  // =========================

  const min = Number(minPrice);
  const max = Number(maxPrice);

  if (minPrice !== undefined && minPrice !== "" && Number.isFinite(min)) {
    filters.salePrice = {
      ...(filters.salePrice || {}),
      $gte: min,
    };
  }

  if (maxPrice !== undefined && maxPrice !== "" && Number.isFinite(max)) {
    filters.salePrice = {
      ...(filters.salePrice || {}),
      $lte: max,
    };
  }
  // =========================
  // SORTING
  // =========================
  const sortMap = {
    newest: {
      createdAt: -1,
    },

    lowToHigh: {
      salePrice: 1,
    },

    highToLow: {
      salePrice: -1,
    },

    priceLowToHigh: {
      salePrice: 1,
    },

    priceHighToLow: {
      salePrice: -1,
    },

    topRated: {
      averageRating: -1,
      totalReviews: -1,
    },
  };

  const sortOption = sortMap[sortBy] || {
    createdAt: -1,
  };

  // =========================
  // PAGINATION
  // =========================
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);

  const skip = (pageNumber - 1) * limitNumber;

  // =========================
  // QUERY
  // =========================
  const [products, total] = await Promise.all([
    Product.find(filters)
      .populate("categoryId", "name parentId isActive")
      .populate("ownerId", "name image")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber),

    Product.countDocuments(filters),
  ]);

  // =========================
  // RESPONSE
  // =========================
  return res.status(200).json({
    responseCode: "00",
    status: "success",
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPages: Math.ceil(total / limitNumber),
    data: products,
  });
});

const getProductsByOwner = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.params.id) filter.ownerId = req.params.id;
  const products = await Product.find(filter);

  console.log("Products Be like", products);

  if (!products) {
    return next(new AppError("Prodcut Not found", 404));
  }

  res.status(200).json({
    responseCode: "00",
    status: "success",
    data: sanitizeResponse(products),
  });
});

const getProductsByCategory = catchAsync(async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const products = await Product.find({
    categoryId,
  });

  if (!products) {
    return next(new AppError("Prodcut Not found", 404));
  }

  res.status(200).json({
    responseCode: "00",
    status: "success",
    data: sanitizeResponse(products),
  });
});

const updateProductData = async (req, res, next) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updated) {
    return next(new AppError("Prodcut Not found", 404));
  }

  res.status(201).json({
    responseCode: "00",
    status: "success",
    data: sanitizeResponse(updated),
  });
};

const updateProductStatus = async (req, res, next) => {
  const { status } = req.query;
  if (!status) {
    return next(new AppError("Status is required", 402));
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Prodcut Not found", 404));
  }

  console.log(product);
  product.status = status;

  const updated = await product.save();

  res.status(201).json({
    responseCode: "00",
    status: "success",
    data: sanitizeResponse(updated),
  });
};

// ========================
// DELETE PRODUCT
// ========================
const deleteProduct = catchAsync(async (req, res, next) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return next(new AppError("Product Not found", 404));
  }

  res.status(200).json({
    responseCode: "00",
    status: "success",
    message: "The product deleted successfully",
  });
});

const addProductToFavourite = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const buyerId = req.user.id;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product Not found", 404));
  }

  const existingItem = await Favourite.findOne({ buyerId, productId });
  if (existingItem) {
    return next(new AppError("Product already In Cart", 402));
  }

  // Create cart item
  const fav = await Favourite.create({
    buyerId,
    productId,
  });

  res.status(201).json({
    code: "00",
    successIndicator: "success",
    data: fav,
  });
});

const getBuyerFavourites = catchAsync(async (req, res, next) => {
  const buyerId = req.params.buyerId;

  const items = await Favourite.find({ buyerId });
  if (!items) {
    return next(new AppError("No Favourite Items", 404));
  }

  res.status(200).json({
    code: "00",
    successIndicator: "success",
    data: items,
  });
});

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
    data: deleted,
  });
});

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

  if (!relevantOrder || relevantOrder?.status !== "completed") {
    return next(new AppError("No Completed Order Found", 404));
  }

  await ProductReview.create({ productId, userId, rating, comment });

  const stats = await ProductReview.aggregate([
    { $match: { productId: product._id } },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  const averageRating = Math.round(stats[0]?.avgRating * 10) / 10;
  const totalReviews = stats[0]?.count;

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    totalReviews,
  });

  res.status(201).json({
    responseCode: "00",
    status: "success",
    data: {
      averageRating,
      totalReviews,
    },
  });
});

const getProductReviews = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const reviews = await ProductReview.find({ productId })
    .populate("userId", "name image")
    .sort({ createdAt: -1 });

  const product = await Product.findById(productId).select(
    "averageRating totalReviews",
  );
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

  const review = await ProductReview.findOne({
    _id: req.params.reviewId,
    userId,
  });
  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  const stats = await ProductReview.aggregate([
    { $match: { productId: review.productId } },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
    },
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

  const review = await ProductReview.findOne({
    _id: req.params.reviewId,
    userId,
  });
  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  const productId = review.productId;
  await review.deleteOne();

  const stats = await ProductReview.aggregate([
    { $match: { productId } },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  const averageRating = stats.length
    ? Math.round(stats[0].avgRating * 10) / 10
    : 0;
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
    parentId: parentId || null,
  });

  if (exists) {
    return next(new AppError("Category already exists", 400));
  }

  const category = await Category.create({
    name,
    parentId: parentId || null,
    level,
  });

  res.status(201).json({
    responseCode: "00",
    status: "success",
    data: sanitizeResponse(category),
  });
});

const getRootCategories = catchAsync(async (req, res) => {
  const { parentId } = req.query;

  console.log("Parrrrent Id", parentId);

  const filter = {
    isActive: true,
  };

  if (parentId) {
    filter.parentId = parentId;
  } else {
    filter.parentId = null;
  }

  const categories = await Category.find(filter).sort({ name: 1 });

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
    isActive: true,
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
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    responseCode: "00",
    status: "success",
    data: sanitizeResponse(category),
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const { name, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
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

//Newly added function to get recommended products based on user preferences

const getRecommendedProducts = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const limit = Math.min(
        Math.max(Number(req.query.limit) || 20, 1),
        50
    );

    const user = await User.findById(userId)
        .select("preferences hasSetPreferences")
        .lean();

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    const preferences = user.preferences || {};

    const brands = preferences.brands || [];
    const categories = preferences.categories || [];
    const sizes = preferences.sizes || [];
    const styles = preferences.styles || [];

    const hasPreferences =
        brands.length > 0 ||
        categories.length > 0 ||
        sizes.length > 0 ||
        styles.length > 0;

    // ==========================================
    // NO PREFERENCES
    // RETURN RANDOM PRODUCTS
    // ==========================================

    if (!hasPreferences) {
        const products = await Product.aggregate([
            {
                $match: {
                    status: "approved",
                    stock: { $gt: 0 },
                },
            },
            {
                $sample: {
                    size: limit,
                },
            },
        ]);

        return res.status(200).json({
            responseCode: "00",
            status: "success",
            data: {
                products,
                total: products.length,
                personalizedProducts: 0,
                randomProducts: products.length,
            },
        });
    }

    // ==========================================
    // PERSONALIZED PRODUCTS
    // ==========================================

    const personalizedProducts = await Product.aggregate([
        {
            $match: {
                status: "approved",
                stock: { $gt: 0 },
            },
        },

        {
            $addFields: {
                preferenceScore: {
                    $add: [

                        // BRAND = 4 POINTS
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: [brands.length, 0] },
                                        {
                                            $in: [
                                                "$brand",
                                                brands,
                                            ],
                                        },
                                    ],
                                },
                                4,
                                0,
                            ],
                        },

                        // CATEGORY = 2 POINTS
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: [categories.length, 0] },
                                        {
                                            $in: [
                                                "$categoryId",
                                                categories,
                                            ],
                                        },
                                    ],
                                },
                                2,
                                0,
                            ],
                        },

                        // SIZE = 2 POINTS
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: [sizes.length, 0] },
                                        {
                                            $in: [
                                                "$size",
                                                sizes,
                                            ],
                                        },
                                    ],
                                },
                                2,
                                0,
                            ],
                        },

                        // STYLE = 3 POINTS
                        {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: [styles.length, 0] },
                                        {
                                            $gt: [
                                                {
                                                    $size: {
                                                        $setIntersection: [
                                                            {
                                                                $ifNull: [
                                                                    "$styles",
                                                                    [],
                                                                ],
                                                            },
                                                            styles,
                                                        ],
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    ],
                                },
                                3,
                                0,
                            ],
                        },
                    ],
                },
            },
        },

        // Only products matching at least
        // one preference
        {
            $match: {
                preferenceScore: {
                    $gt: 0,
                },
            },
        },

        // Highest preference match first
        {
            $sort: {
                preferenceScore: -1,
                averageRating: -1,
                totalReviews: -1,
                createdAt: -1,
            },
        },

        {
            $limit: limit,
        },
    ]);

    // ==========================================
    // RANDOM FALLBACK
    // ==========================================

    const remaining =
        limit - personalizedProducts.length;

    let randomProducts = [];

    if (remaining > 0) {
        const personalizedIds =
            personalizedProducts.map(
                (product) => product._id
            );

        randomProducts = await Product.aggregate([
            {
                $match: {
                    status: "approved",
                    stock: { $gt: 0 },
                    _id: {
                        $nin: personalizedIds,
                    },
                },
            },
            {
                $sample: {
                    size: remaining,
                },
            },
        ]);
    }

    // ==========================================
    // FINAL RESULT
    // ==========================================

    const products = [
        ...personalizedProducts,
        ...randomProducts,
    ];

    return res.status(200).json({
        responseCode: "00",
        status: "success",
        data: {
            products,
            total: products.length,
            personalizedProducts:
                personalizedProducts.length,
            randomProducts:
                randomProducts.length,
        },
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
  updateCategory,
  getRecommendedProducts
};
