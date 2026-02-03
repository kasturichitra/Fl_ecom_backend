import express from "express";
import {
  createOrderController,
  getAllOrdersController,
  updateOrderController,
  getOrderProductController,
  getOrderSingleProductController,
  updateOrderStatusController,
} from "./orderController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = express.Router();

router.post(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-order",
  }),
  createOrderController,
);

router.get(
  "/orderProduct",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-order-single-product",
  }),
  getOrderSingleProductController,
);

router.get(
  "/search",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-orders",
  }),
  getAllOrdersController,
);

router.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-order-product",
  }),
  getOrderProductController,
);

router.put(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-order",
  }),
  updateOrderController,
);

router.patch(
  "/:id/status",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-order-status",
  }),
  updateOrderStatusController,
);

export default router;
