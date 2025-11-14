import Influencer from '../models/influencer.model.js';
import bcrypt from "bcryptjs";
import catchAsync from '../utils/catchAsync.js';


// ------------------- CREATE Influencer -------------------
const createInfluencers = catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (role !== "influencer") {
        return res.status(400).json({
            code: "01",
            successIndicator: false,
            message: "Admins are only allowed to create users with role 'influencer'."
        });
    }

    const userExist = await Influencer.findOne({ email });
    if (userExist) {
        return res.status(400).json({
            code: "01",
            successIndicator: false,
            message: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Influencer.create({
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: true
    });

    res.status(201).json({
        code: "00",
        successIndicator: true,
        data: {
            message: `Influencer ${name} created successfully`,
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            isVerified: newUser.isVerified
        }
    });
});


// ------------------- GET All Influencers -------------------
const getInfluencers = catchAsync(async (req, res) => {
    const users = await Influencer.find({ role: "influencer" });

    res.status(200).json({
        code: "00",
        successIndicator: true,
        data: {
            count: users.length,
            users: users.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                isVerified: u.isVerified
            }))
        }


    });
});


// ------------------- GET Single Influencer -------------------
const getInfluencerById = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await Influencer.findById(id);
    if (!user) return res.status(404).json({ message: "Influencer not found" });

    res.status(200).json({
        code: "00",
        successIndicator: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }
    });
});


// ------------------- UPDATE Influencer -------------------
const updateInfluencer = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const updated = await Influencer.findByIdAndUpdate(
        id,
        { name, email },
        { new: true }
    );

    if (!updated) {
        return res.status(404).json({
            code: "00",
            successIndicator: false,
            data: {
                message: "Influencer not found"
            }
        });
    }

    res.status(200).json({
        code: "00",
        successIndicator: true,
        data: {
            message: "Influencer updated successfully",
            user: {
                _id: updated._id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                isVerified: updated.isVerified
            }
        }
    });
});


// ------------------- DELETE Influencer -------------------
const deleteInfluencer = catchAsync(async (req, res) => {
    const { id } = req.params;

    const deleted = await Influencer.findByIdAndDelete(id);

    if (!deleted) {
        return res.status(404).json({
            code: "01",
            successIndicator: false,
            data: {
                message: "Influencer not found"
            }
        });
    }

    res.status(200).json({
        code: "01",
        successIndicator: false,
        data: {
            message: "Influencer deleted successfully",
            deletedId: id
        }
    });
});

export { createInfluencers, getInfluencers, getInfluencerById, updateInfluencer, deleteInfluencer };