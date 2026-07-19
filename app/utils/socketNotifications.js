import { io } from "../server.js";

export const emitNotification = (userIds, notification) => {



    const recipients = Array.isArray(userIds)
        ? userIds
        : [userIds];

    recipients.forEach(userId => {
        console.log("USER IDS", userId)
        io.to(userId.toString()).emit(
            "receiveNotification",
            notification
        );
    });

};