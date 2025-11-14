import Product from "../models/influencer.product.model.js";

import mongoose from "mongoose";
const sendResponse = (res, data, code = "00", success = true) => {
  return res.status(200).json({
    code,
    successIndicator: success,
    data
  });
};

// ========================
// Helper: Required Validation
// ========================
const validateProductFields = (body) => {
  const errors = [];

  if (!body.name) errors.push("Product name is required");
  if (!body.price) errors.push("Product price is required");
  if (!body.influencerId) errors.push("Influencer ID is required");

  return errors;
};


// ========================
// CREATE PRODUCT
// ========================
const createProduct = async (req, res) => {
  try {
    const errors = validateProductFields(req.body);
    if (errors.length > 0) {
      return sendResponse(res, { message: errors.join(", ") }, "01", false);
    }

    const product = await Product.create(req.body);

    return sendResponse(res, {
      message: "Product created successfully",
      product
    });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};


// ========================
// GET ALL PRODUCTS (filter by influencer or status)
// ========================
const getAllProducts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.influencerId) filter.influencerId = req.query.influencerId;
    if (req.query.status) filter.status = req.query.status;

    const products = await Product.find(filter);

    return sendResponse(res, {
      total: products.length,
      products
    });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};


// ========================
// GET PRODUCT BY ID
// ========================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, { message: "Product not found" }, "01", false);
    }

    return sendResponse(res, product);
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};
// ========================
// GET PRODUCT BY INFLUENCER ID
// ========================
const getProductsByInfluencerId = async (req, res) => {
  try {
    let { influencerId } = req.params;
    console.log("-----------------",influencerId)

    // Trim spaces
    influencerId = influencerId.trim();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(influencerId)) {
      return sendResponse(
        res,
        { message: "Invalid Influencer ID format" },
        "01",
        false
      );
    }

    // Convert to ObjectId
    const id = new mongoose.Types.ObjectId(influencerId);

    const products = await Product.find({ influencerId: id });

    return sendResponse(res, {
      total: products.length,
      products,
    });

  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};

// ========================
// UPDATE PRODUCT
// ========================
const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return sendResponse(res, { message: "Product not found" }, "01", false);
    }

    return sendResponse(res, {
      message: "Product updated successfully",
      product: updated
    });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};


// ========================
// APPROVE / REJECT PRODUCT
// ========================
const updateProductStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return sendResponse(res, { message: "Status is required" }, "01", false);
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, { message: "Product not found" }, "01", false);
    }

    product.status = status;
    if (reason) product.reason = reason;

    await product.save();

    return sendResponse(res, {
      message: `Product ${status}`,
      new_status: status
    });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};


// ========================
// DELETE PRODUCT
// ========================
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return sendResponse(res, { message: "Product not found" }, "01", false);
    }

    return sendResponse(res, { message: "Product removed" });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};



export {
  deleteProduct,
  updateProductStatus,
  updateProduct,
  getProductById,
  createProduct,
  getAllProducts,
  getProductsByInfluencerId
}