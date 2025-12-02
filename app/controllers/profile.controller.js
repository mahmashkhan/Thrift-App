import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";
import catchAsync from "../utils/catchAsync.js";

// ====================== GET PROFILE ======================
const getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return next(new AppError('User ID is required', 400));
        }

        const profile = await User.findById(id);

        if (!profile) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            code: "00",
            successIndicator: "success",
            data: profile
        });

    } catch (err) {
        next(err);
    }
};


// ====================== EDIT PROFILE ======================
const editProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, password } = req.body;

        if (!id) {
            return next(new AppError("User ID is required", 400));
        }

        let updatedFields = { name };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedFields.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({
            code: "00",
            successIndicator: "success",
            message: "Profile updated successfully",
            data: updatedUser
        });

    } catch (err) {
        next(err);
    }
};



// ====================== DELETE PROFILE ======================
const deleteProfile = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError("User ID is required", 400));
    }
// console.log(req.user.id)

    if (!req.user) {
        return next(new AppError("Unauthorized: user not logged in", 401));
    }


    const userToDelete = await User.findById(id);
    if (!userToDelete) {
        return next(new AppError("User not found", 404));
    }


     const isOwner = req.user.id.toString() === id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return next(new AppError("You are not allowed to delete this account", 403));
    }


    await User.findByIdAndDelete(id);

    res.status(200).json({
        code: "00",
        successIndicator: "success",
        message: "Account deleted successfully"
    });
});


export { getProfile, editProfile, deleteProfile };
