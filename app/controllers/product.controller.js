import Product from "../models/product.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";


const createProduct = async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: product
    });
};



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
const deleteProduct = async (req, res, next) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
        return next(new AppError('Prodcut Not found', 404))
    }

    return sendResponse(res, { message: "Product removed" });

};





export { createProduct, getProductByStatus, getSingleProduct, getProductsByOwner, updateProductData, updateProductStatus, deleteProduct }