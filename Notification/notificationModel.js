import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";


const notificationSchema = new mongoose.Schema(
  {
    sender: {//sender is the user who will send the notification
      type: String,
      required: [true, "Sender ID is required"],
    },
    senderModel: {//senderModel is the model of the user who will send the notification
      type: String,
      required: [true, "Sender model is required"],
      enum: ["user", "admin"],
    },

    receiver: {//receiver is the user who will receive the notification
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverModel",
    },
    receiverModel: {//receiverModel is the model of the user who will receive the notification
      type: String,
      enum: ["user", "admin"],
    },

    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "order",
        "order_placed",
        "order_cancelled",
        "order_returned",
        "order_shipped",
        "order_delivered",
        "order_update",
        "refund",
        "offer",
        "wallet",
        "system",
        "custom"
      ],
      default: "custom",
    },

    relatedId: {
      type: String,
      trim: true
    },

    relatedModel: {//relatedModel is the model of the related model
      type: String,
      enum: ["Order", "OfferBanner"],
    },

    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },

    is_broadcast: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
notificationSchema.index({ receiver: 1, read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ receiverModel: 1 });


export const NotificationModel = async (tenantId) => {
  const tenantDB = await getTenanteDB(tenantId);
  return tenantDB.model("Notification", notificationSchema);
};
