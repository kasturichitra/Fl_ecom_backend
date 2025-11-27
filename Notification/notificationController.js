import { getAllNotificationService, markNotificationAsReadService } from "./notificationService.js";

export const getAllNotificationController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { role, userId, sort } = req.query;
    const respones = await getAllNotificationService(tenantID, role, userId, sort);
    return res.status(200).json({
      success: true,
      message: "All Notifications",
      respones,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markNotificationAsReadController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const payload = req.body;
    const response = await markNotificationAsReadService(tenantID, payload);
    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};