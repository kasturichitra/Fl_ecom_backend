
import { NotificationModel } from "../Notification/notificationModel.js";
import { io, connectedUsers } from "../server.js";

/**
 * Send notification to a specific user
 */
export const sendUserNotification = async (tenantID, userId, data) => {
  try {
    const Notification = await NotificationModel(tenantID);
    const saved = await Notification.create({
      sender: data.sender || "System",
      senderModel: data.senderModel || "Admin",
      receiver: userId,
      receiverModel: "User",
      title: data.title,
      message: data.message,
      type: data.type || "custom",
      relatedId: data.relatedId || null,
      relatedModel: data.relatedModel || null,
      link: data.link || null,
    });

    // 🔹 Send through Socket.IO if user is online
    const socketId = connectedUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit("newNotification", saved);
      console.log(`Sent notification to user ${userId}`);
    }

    return saved;
  } catch (err) {
    console.error("SendUserNotification error:", err.message);
    throw err;
  }
};

/**
 * Send notification to all admin users
 */
export const sendAdminNotification = async (tenantID, data) => {
  try {
    const Notification = await NotificationModel(tenantID);
    const saved = await Notification.create({
      sender: data.sender || "System",
      senderModel: data.senderModel || "User",
      receiver: null,
      receiverModel: "Admin",
      title: data.title,
      message: data.message,
      type: data.type || "system",
      is_broadcast: true,
    });

    for (const [key, socketId] of connectedUsers.entries()) {
      if (key.startsWith("admin_")) {
        io.to(socketId).emit("newAdminNotification", saved);
      }
    }

    console.log("Broadcasted admin notification");
    return saved;
  } catch (err) {
    console.error("SendAdminNotification error:", err.message);
    throw err;
  }
};
