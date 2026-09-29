import { getIO } from "../socket/index.js";

export const emitNotification = (userIds, notification) => {



    const recipients = Array.isArray(userIds)
        ? userIds
        : [userIds];

    recipients.forEach(userId => {
        console.log("USER IDS", userId)
        getIO.to(userId.toString()).emit(
            "receiveNotification",
            notification
        );
    });

};