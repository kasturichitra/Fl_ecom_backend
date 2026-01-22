import express from "express";
import {
  createConfigController,
  getAllConfigsController,
  getConfigByIdController,
  getCurrentConfigController,
  updateConfigController,
  deleteConfigController,
} from "./configController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

// Create config
router.post(
  "/",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-config",
  }),
  createConfigController
);

// Get current config (convenience endpoint)
router.get(
  "/current",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-current-config",
  }),
  getCurrentConfigController
);

// Get all configs (with filters, pagination, sorting)
router.get(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-configs",
  }),
  getAllConfigsController
);

// Get config by ID
router.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-config-by-id",
  }),
  getConfigByIdController
);

// Update config
router.put(
  "/",
  verifyToken, 
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-config",
  }),
  updateConfigController
);

// Delete config
router.delete(
  "/:id",
  verifyToken, 
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "delete-config",
  }),
  deleteConfigController
);

export default router;
