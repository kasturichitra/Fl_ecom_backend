import express from "express";
import { getAllNotificationController, markNotificationAsReadController } from "./notificationController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const route = express.Router();

route.get(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-notification",
  }),
  getAllNotificationController
);

route.put(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "mark-notification-as-read",
  }),
  markNotificationAsReadController
);

export default route;
