import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { NotificationModel } from "./notificationModel.js";
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
// export const getAllNotificationController = async (req, res) => {
//   try {
//     const tenantID = req.headers["x-tenant-id"];
//     if (!tenantID) {
//       return res.status(400).json({
//         status: "Failed",
//         message: "Tenant ID is required",
//       });
//     }

//     const { role, userId, page = 1, limit = 10, sort } = req.query;

//     const respones = await getAllNotificationService(
//       tenantID,
//       role,
//       userId,
//       Number(page),
//       Number(limit),
//       sort
//     );

//     res.status(200).json(
//       successResponse("All Notifications", {
//         data: respones.notifications,
//         totalCount: respones.totalCount,
//         currentPage: respones.currentPage,
//         totalPages: respones.totalPages,
//       })
//     );
//   } catch (error) {
//     res.status(500).json(errorResponse(error.message, error));
//   }
// };

export const getAllNotificationController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) {
      return res.status(400).json({
        status: "Failed",
        message: "Tenant ID is required",
      });
    }

    const { role, userId, page = 1, limit = 10, sort, fromDate, toDate } = req.query;

    let query = {};

    // 📅 Date filter like min/max pattern
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const response = await getAllNotificationService(
      tenantID,
      role,
      userId,
      Number(page),
      Number(limit),
      sort,
      fromDate,
      toDate
    );

    res.status(200).json(
      successResponse("All Notifications", {
        data: response.notifications,
        totalCount: response.totalCount,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
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
