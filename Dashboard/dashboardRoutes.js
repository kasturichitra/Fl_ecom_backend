import { Router } from "express";

import {
  getOrdersByOrderTypeController,
  getOrdersByPaymentMethodController,
  getOrdersByStatusController,
  getOrdersTrendController,
  getTopBrandsByCategory,
  getTopProductsByCategory,
  getUsersTrendController,
} from "./dashboardController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = Router();

router.get(
  "/topbrands",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-top-brands-by-category",
  }),
  getTopBrandsByCategory
);

router.get(
  "/topproducts",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-top-products-by-category",
  }),
  getTopProductsByCategory
);

router.get(
  "/orders/status",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-orders-by-status",
  }),
  getOrdersByStatusController
);

router.get(
  "/orders/payment-method",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-orders-by-payment-method",
  }),
  getOrdersByPaymentMethodController
);

router.get(
  "/orders/order-type",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-orders-by-order-type",
  }),
  getOrdersByOrderTypeController
);

router.get(
  "/orders/trend",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-orders-trend",
  }),
  getOrdersTrendController
);

router.get(
  "/users/trend",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-users-trend",
  }),
  getUsersTrendController
);

export default router;
