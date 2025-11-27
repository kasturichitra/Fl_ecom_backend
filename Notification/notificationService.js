import { buildSortObject } from "../utils/buildSortObject.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import { NotificationModel } from "./notificationModel.js";


export const getAllNotificationService = async (tenantId, role, userId, sort) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    const NotificationModelDB = await NotificationModel(tenantId);

    let filter = {};

    if (role === "User") {
        filter = {
            receiverModel: "User",
            read: false, // Add this line to filter for unread notifications
            $or: [
                { receiver: userId },
                { is_broadcast: true }
            ]
        };
    }
    if (role === "Admin") {
        filter = {
            receiverModel: "Admin",
            read: false
        };
    }
    const sortObj = buildSortObject(sort)
    return await NotificationModelDB.find(filter).sort(sortObj);
};

export const markNotificationAsReadService = async (tenantId, payload) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    const NotificationModelDB = await NotificationModel(tenantId);

    let idsToUpdate = [];
    if (Array.isArray(payload.ids)) {
        idsToUpdate = payload.ids;
    } else if (payload.id) {
        idsToUpdate = [payload.id];
    }

    if (idsToUpdate.length === 0) {
        throw new Error("No notification IDs provided");
    }

    const result = await NotificationModelDB.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { read: true } }
    );

    return result;
};

