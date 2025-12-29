import express from "express";

import getUploadMiddleware from "../utils/multerConfig.js";
import {
  createBulkProductsController,
  createProductController,
  deleteProductController,
  downloadExcelTemplateController,
  generateProductQrPdfController,
  // getProductByIdController,
  // getProductsBysubUniqeIDController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
} from "./productController.js";
import verifyPermission from "../utils/verifyPermission.js";
import verifyToken from "../utils/verifyToken.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = express.Router();
const upload = getUploadMiddleware("Product");

router.post(
  "/",
  verifyToken,
  // verifyPermission("product:create"),
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 20,
    keyPrefix: "create-product",
  }),
  createProductController
);

router.post(
  "/bulk",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "bulk-upload-product",
  }),
  upload.single("file"),
  createBulkProductsController
);

router.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-product-by-id",
  }),
  getProductByIdController
);

router.get(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-products",
  }),
  getAllProductsController
);

router.put(
  "/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-product",
  }),
  updateProductController
);

router.delete(
  "/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "delete-product",
  }),
  deleteProductController
);

// Get excel template
router.get(
  "/excel-template/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 20,
    keyPrefix: "download-product-excel-template",
  }),
  verifyToken,
  downloadExcelTemplateController
);

router.put(
  "/qr-pdf/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 20,
    keyPrefix: "generate-product-qr-pdf",
  }),
  verifyToken,
  generateProductQrPdfController
);

// router.get("/sub-category/:id", getProductsBysubUniqeIDController);
// Bottom to ensure express routing error doesn't happen
// router.get("/:id", getProductByIdController);

export default router;
