import Favourite from "../models/favourite.model.js";
import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";


const createProduct = catchAsync(async (req, res, next) => {
    let { saleType, ownerId, ...rest } = req.body;

    if (saleType === "self" || saleType === "sellForMe") {
        ownerId = req.user.id;
    } else if (saleType === "influencer") {
        if (!ownerId) {
            return next(new AppError("ownerId is required for influencer sale type", 400));
        }
        ownerId = ownerId;
    }

    const product = await Product.create({
        ...rest,
        saleType,
        ownerId,
        status: "pending"
    });


    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: product
    });
});


// get all products by status
const getProductByStatus = catchAsync(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const products = await Product.find(filter);

    res.status(200).json({
        code: "00",
        successIndicator: "success",
        data: products
    });
});

const getSingleProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Prodcut Not found', 404))
    }

    res.status(200).json({
        code: "00",
        successIndicator: "success",
        data: product
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
        code: "00",
        successIndicator: "success",
        data: products
    });

});



const updateProductData = async (req, res) => {
    const updated = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    if (!updated) {
        return next(new AppError('Prodcut Not found', 404))
    }

    res.status(201).json({
        code: "00",
        successIndicator: "success",
        data: updated
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
        code: "00",
        successIndicator: "success",
        data: updated
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

    return sendResponse(res, { message: "Product removed" });

});


const addProductToFavourite = catchAsync(async (req, res, next) => {
    const { productId } = req.body;
    const buyerId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Prodcut Not found', 404))
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
    const buyerId = req.params.id;

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

    const deleted = await Favourite.findByIdAndDelete({ itemId });
    if (!deleted) {
        return next(new AppError("No Favourite Items", 404));
    }

    res.status(200).json({
        code: "00",
        successIndicator: "success",
        data: deleted
    });
})



export { createProduct, getProductByStatus, getSingleProduct, getProductsByOwner, updateProductData, updateProductStatus, deleteProduct, addProductToFavourite, getBuyerFavourites, removeItemFromFav, getSingleFavouriteItem }