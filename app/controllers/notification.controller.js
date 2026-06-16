// controllers/notification.controller.js
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { successResponse, errorResponse } from '../utils/common/responseObject.js';
import catchAsync from '../utils/catchAsync.js';

// controllers/notification.controller.js

const getExpiryDate = (type) => {
    const now = new Date();
    switch (type) {
        case 'promo':
            // Promo notifications vanish after 7 days
            return new Date(now.setDate(now.getDate() + 7));
        case 'broadcast':
            // General admin messages vanish after 30 days
            return new Date(now.setDate(now.getDate() + 30));
        case 'order':
            // Order notifications never vanish
            return null;
        case 'alert':
            // Account alerts never vanish
            return null;
        default:
            return new Date(now.setDate(now.getDate() + 30));
    }
};

const sendNotificationToAll = catchAsync(async (req, res) => {
    const { title, message, type } = req.body;

    const expiresAt = getExpiryDate(type);

    const notification = await Notification.create({
        title,
        message,
        type,
        sentBy:    req.user._id,
        expiresAt
    });

    await User.updateMany(
        { role: { $in: ['buyer', 'seller'] } },
        {
            $push: {
                notifications: {
                    notification: notification._id,
                    isRead: false
                }
            }
        }
    );

    

    successResponse(res, 200, { message: "Notification sent", notification });
});
// User fetches their notifications
const getMyNotifications = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate({
            path: 'notifications.notification',
            match: {
                //  Only return non-expired notifications
                $or: [
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            }
        })
        .select('notifications');

    // Filter out null (expired notifications get populated as null)
    const active = user.notifications.filter(n => n.notification !== null);
    const unreadCount = active.filter(n => !n.isRead).length;

    // ✅ Optional: clean up expired refs from user document
    await User.updateOne(
        { _id: req.user._id },
        {
            $pull: {
                notifications: {
                    notification: null
                }
            }
        }
    );

    successResponse(res, 200, {
        notifications: active,
        unreadCount
    });
});

// User marks a notification as read
const markAsRead = catchAsync(async (req, res) => {
    await User.updateOne(
        {
            _id: req.user._id,
            'notifications.notification': req.params.id
        },
        {
            $set: {
                'notifications.$.isRead': true,
                'notifications.$.readAt': new Date()
            }
        }
    );

    successResponse(res, 200, { message: "Marked as read" });
});

export { sendNotificationToAll, getMyNotifications, markAsRead };