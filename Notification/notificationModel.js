import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: [true, "Sender ID is required"],
    },
    senderModel: {
      type: String,
      required: [true, "Sender model is required"],
      enum: ["User", "Admin"],
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverModel",
    },
    receiverModel: {
      type: String,
      enum: ["User", "Admin"],
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
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedModel",
    },

    relatedModel: {
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

export const NotificationModel = async (tenantId) => {
  const tenantDB = await getTenanteDB(tenantId);
  return tenantDB.model("Notification", notificationSchema);
};
