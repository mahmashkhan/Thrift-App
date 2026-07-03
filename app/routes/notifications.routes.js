import { Router } from "express";
import { getMyNotifications, sendNotificationToAll, sendNotificationToOne } from "../controllers/notification.controller.js";
import { allowedUsers } from "../middleware/authorizationMiddleware.js";
const router = Router();

router.post('/send/all', allowedUsers("admin"), sendNotificationToAll);
// routes/notification.routes.js
router.post('/send/:userId', allowedUsers(), sendNotificationToOne);
router.get('/get', allowedUsers(), getMyNotifications);


export default router;
