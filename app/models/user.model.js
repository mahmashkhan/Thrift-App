import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: function () {
            return !this.googleId && !this.facebookId && !this.appleId;
        }
    },

    googleId: {
        type: String,
        default: null
    },

    facebookId: {
        type: String,
        default: null
    },

    appleId: {
        type: String,
        default: null
    },

    roles: [{
        type: String,
        enum: [
            "buyer",
            "seller",
            "admin",
            "influencer"
        ]
    }],

    phone: String,

    image: String,

    status: {
        type: String,
        enum: [
            "active",
            "inactive",
            "suspended"
        ],
        default: "active"
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    preferences: {

        brands: [String],

        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],

        sizes: [String],

        styles: [String]
    },

    hasSetPreferences: {
        type: Boolean,
        default: false
    },

    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],

    notifications: [
        {
            notification: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Notification"
            },

            isRead: {
                type: Boolean,
                default: false
            },

            readAt: Date
        }
    ]

}, {
    timestamps: true
});


const SellerProfileSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true
    },


    dateOfBirth: Date,

    location: String,

    addressLine1: String,

    paypalEmail: String,

    averageRating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: [
            "pending",
            "approved",
            "rejected",
            "inactive"
        ],
        default: "approved"
    }

}, {
    timestamps: true
});



const InfluencerProfileSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true
    },

    commissionRate: {
        type: Number,
        default: 0
    },

    campaignsRun: {
        type: Number,
        default: 0
    },

    totalReferrals: {
        type: Number,
        default: 0
    },

    commissionEarned: {
        type: Number,
        default: 0
    },

    averageRating: {
        type: Number,
        default: 0
    },

    totalReviews: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: [
            "pending",
            "approved",
            "rejected"
        ],
        default: "pending"
    }
});


const User = mongoose.model("User", UserSchema);
const Influencer = mongoose.model('Influencer', InfluencerProfileSchema);
const Seller = mongoose.model('Seller', SellerProfileSchema);


export {
    User,
    Influencer,
    Seller
};
