import { NotificationModel } from "../Notification/notificationModel.js";
import { io, connectedUsers } from "../server.js";
import UserModel from "../Users/userModel.js";
import { fcm } from "./firebase-admin.js";

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
      receiver: adminId,
      receiverModel: "Admin",
      title: data.title,
      message: data.message,
      type: data.type || "system",
      is_broadcast: true,
    });

    io.to("admins").emit("newAdminNotification", saved);

    const usersDB = await UserModel(tenantID);
    const users = await usersDB.find({ role: "admin" });
    const token = users.map((user) => user.fcm_token);

    fcm.send({
      token,
      notification: {
        title: data.title,
        body: data.message,       
      }
    })

    return saved;
  } catch (err) {
    console.error("SendAdminNotification error:", err.message);
    throw err;
  }
};
