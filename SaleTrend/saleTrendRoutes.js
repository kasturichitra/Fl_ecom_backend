import express from "express";
import {
  createSaleTrendController,
  getAllSaleTrendsController,
  getSaleTrendByUniqueIdController,
  updateSaleTrendController,
  deleteSaleTrendController,
  // addProductsToTrendController,
  // removeProductsFromTrendController,
} from "./saleTrendController.js";
import verifyToken from "../utils/verifyToken.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const route = express.Router();

route.post(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-sale-trend",
  }),
  verifyToken,
  createSaleTrendController
);

route.get(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-sale-trends",
  }),
  getAllSaleTrendsController
);

route.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-sale-trend-by-unique-id",
  }),
  getSaleTrendByUniqueIdController
);

route.put(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-sale-trend",
  }),
  verifyToken,
  updateSaleTrendController
);

route.delete(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "delete-sale-trend",
  }),
  verifyToken,
  deleteSaleTrendController
);

// Atomic updates for products
// route.put("/:id/add-products", addProductsToTrendController);
// route.put("/:id/remove-products", removeProductsFromTrendController);

export default route;
