import express from "express";
import {
  createOrderController,
  getAllOrdersController,
  updateOrderController,
  getOrderProductController,
  getOrderSingleProductController,
} from "./orderController.js";
import rateLimiter from "../../lib/redis/rateLimiter.js";

const route = express.Router();

route.post(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-order",
  }),
  createOrderController
);

route.get(
  "/orderProduct",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-order-single-product",
  }),
  getOrderSingleProductController
);

route.get(
  "/search",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-orders",
  }),
  getAllOrdersController
);

route.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-order-product",
  }),
  getOrderProductController
);

route.put(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-order",
  }),
  updateOrderController
);

export default route;
