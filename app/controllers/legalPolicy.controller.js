import LegalPolicy from "../models/legal.policies.model.js";

// ==============================
// Unified response helper
// ==============================
const sendResponse = (res, data, code = "00", success = true) => {
  return res.status(200).json({
    code,
    successIndicator: success,
    data
  });
};

// ==============================
// Create Policy
// ==============================
 const createPolicy = async (req, res) => {
  try {
    const policy = await LegalPolicy.create(req.body);
    return sendResponse(res, {
      message: "Policy created successfully",
      policy // includes _id
    });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};

// ==============================
// Get all Policies
// ==============================
 const getAllPolicies = async (req, res) => {
  try {
    const policies = await LegalPolicy.find();
    return sendResponse(res, {
      total: policies.length,
      policies // array of policies with _id
    });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};

// ==============================
// Get Policy by ID
// ==============================
 const getPolicyById = async (req, res) => {
  try {
    const policy = await LegalPolicy.findById(req.params.id);
    if (!policy) {
      return sendResponse(res, { message: "Policy not found" }, "01", false);
    }
    return sendResponse(res, policy);
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};

// ==============================
// Update Policy
// ==============================
 const updatePolicy = async (req, res) => {
  try {
    const updated = await LegalPolicy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return sendResponse(res, { message: "Policy not found" }, "01", false);
    }
    return sendResponse(res, {
      message: "Policy updated successfully",
      policy: updated
    });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};

// ==============================
// Delete Policy
// ==============================
 const deletePolicy = async (req, res) => {
  try {
    const deleted = await LegalPolicy.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendResponse(res, { message: "Policy not found" }, "01", false);
    }
    return sendResponse(res, { message: "Policy deleted successfully" });
  } catch (error) {
    return sendResponse(res, { message: error.message }, "01", false);
  }
};


export {
    deletePolicy,
    updatePolicy,
    getPolicyById,
    getAllPolicies,
    createPolicy
}