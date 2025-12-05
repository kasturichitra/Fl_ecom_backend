import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAllNotificationService, markNotificationAsReadService } from "./notificationService.js";

// export const getAllNotificationController = async (req, res) => {
//   try {
//     const tenantID = req.headers["x-tenant-id"];
//     const { role, userId, sort } = req.query;
//     const respones = await getAllNotificationService(tenantID, role, userId, sort);
//     res.status(200).json(successResponse("All Notifications", { data: respones, totalCount: respones.totalCount }));
//   } catch (error) {
//     res.status(500).json(errorResponse(error.message, error));
//   }
// };

export const getAllNotificationService = async (tenantId, role, userId, page, limit, sort) => {
    throwIfTrue(!tenantId, "Tenant ID is required");

    page = Math.max(1, +page || 1);
    limit = Math.max(1, +limit || 10);

    const skip = (page - 1) * limit;

    const NotificationModelDB = await NotificationModel(tenantId);

    let filter = {};

    if (role === "User") {
        filter = {
            receiverModel: "User",
            read: false,
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

    const sortObj = buildSortObject(sort);

    const [notifications, totalCount] = await Promise.all([
        NotificationModelDB.find(filter).sort(sortObj).skip(skip).limit(limit),
        NotificationModelDB.countDocuments(filter)
    ]);

    return {
        notifications,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
    };
};



export const markNotificationAsReadController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const payload = req.body;
    const response = await markNotificationAsReadService(tenantID, payload);
    // return res.status(200).json({
    //   success: true,
    //   message: "Notifications marked as read",
    //   response,
    // });

    res.status(200).json(successResponse("Notifications marked as read", { data: response }));
  } catch (error) {
    // return res.status(500).json({
    //   success: false,
    //   message: error.message,
    // });
    res.status(500).json(errorResponse(error.message, error));
  }
};