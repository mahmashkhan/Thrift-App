// models/notification.model.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title:   { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['order', 'promo', 'alert', 'broadcast'],
        default: 'broadcast'
    },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ✅ Auto-expire based on type
    expiresAt: { type: Date, default: null }

}, { timestamps: true });

// ✅ MongoDB auto-deletes document when expiresAt is reached
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Notification', notificationSchema);