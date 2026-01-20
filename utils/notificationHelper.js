import { getTenantModels } from "../lib/tenantModelsCache.js";
import { connectedUsers, io } from "../server.js";
import { fcm } from "./firebase-admin.js";

/**
 * Send notification to a specific user
 */
export const sendUserNotification = async (tenantID, userId, data) => {
  try {
    // const Notification = await NotificationModel(tenantID);
    const { notificationModelDB } = await getTenantModels(tenantID);
    const saved = await notificationModelDB.create({
      sender: data.sender || "System",
      senderModel: data.senderModel || "admin",
      receiver: userId,
      receiverModel: "user",
      title: data.title,
      message: data.message,
      type: data.type || "custom",
      relatedId: data.relatedId || null,
      relatedModel: data.relatedModel || null,
      link: data.link || null,
    });

    // console.log(saved, "use notification saved....?");

    // 🔹 Send through Socket.IO if user is online
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit("newNotification", saved);
    }

    const { userModelDB } = await getTenantModels(tenantID);

    const user = userModelDB.findOne({
      user_id: userId,
    });
    await fcm.send({
      notification: {
        title: data.title,
        body: data.message,
      },
      data: {
        link: data.link || "",
        type: data.type || "system",
        relatedId: data.relatedId || "",
      },
      token: user.fcm_token,
    });

    return saved;
  } catch (err) {
    console.error("SendUserNotification error:", err.message);
    throw err;
  }
};

/**
 * Send notification to all admin users
 */
export const sendAdminNotification = async (tenantID, adminId, data) => {
  try {
    // Handle both (tenantID, data) and (tenantID, adminId, data)
    let finalData = data;
    if (!data && typeof adminId === "object") {
      finalData = adminId;
    }

    if (!finalData) {
      console.error("sendAdminNotification: No data provided");
      return null;
    }

    const { notificationModelDB, userModelDB } = await getTenantModels(tenantID);

    // Fetch all active admins
    const admins = await userModelDB.find({ role: "admin", is_active: true }, "user_id fcm_token");

    if (admins.length === 0) {
      console.log("No active admin users found to notify");
      return null;
    }

    const adminIds = admins.map((a) => a.user_id);

    // Prepare notifications for all admins
    const notificationRecords = adminIds.map((id) => ({
      sender: finalData.sender || "System",
      senderModel: finalData.senderModel || "user",
      receiver: id,
      receiverModel: "admin",
      title: finalData.title,
      message: finalData.message,
      link: finalData.link || null,
      type: finalData.type || "system",
      relatedId: finalData.relatedId || null,
      relatedModel: finalData.relatedModel || null,
      is_broadcast: true,
    }));

    // Create records in database
    const saved = await notificationModelDB.insertMany(notificationRecords);

    // Broadcast real-time through Socket.IO to the "admins" room
    io.to("admins").emit("newAdminNotification", saved[0]);

    // Send FCM notifications individually to each admin
    for (const admin of admins) {
      if (admin.fcm_token) {
        try {
          await fcm.send({
            token: admin.fcm_token,
            notification: {
              title: finalData.title,
              body: finalData.message,
            },
            data: {
              link: finalData.link || "",
              type: finalData.type || "system",
              relatedId: finalData.relatedId || "",
            },
          });
        } catch (fcmErr) {
          console.error(`FCM error for admin ${admin.user_id}:`, fcmErr.message);
        }
      }
    }

    return saved;
  } catch (err) {
    console.error("SendAdminNotification error:", err.message);
    throw err;
  }
};
