import express from "express";
import {
  createBrandController,
  getAllBrandsController,
  getBrandByIdController,
  updateBrandController,
} from "./brandController.js";
import verifyToken from "../utils/verifyToken.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = express.Router();

// Create brand
router.post(
  "/",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-brand",
  }),
  createBrandController
);

// Get all brands (with filters, pagination, sorting)
router.get(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-brands",
  }),
  getAllBrandsController
);

// Get brand by ID
router.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-brand-by-id",
  }),
  getBrandByIdController
);

// Update brand
router.put(
  "/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 10,
    keyPrefix: "update-brand",
  }),
  updateBrandController
);

export default router;
