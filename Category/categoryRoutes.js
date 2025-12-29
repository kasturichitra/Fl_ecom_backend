import express from "express";
import getUploadMiddleware from "../utils/multerConfig.js";
import verifyToken from "../utils/verifyToken.js";
import {
  categoryBulkUploadController,
  createCategoryController,
  deleteCategoryController,
  downloadCategoryExcelTemplateController,
  getAllCategoriesController,
  getCategoriesByIndustryIdController,
  getCategoryByIdController,
  getGroupedIndustriesAndCategoriesController,
  updateCategoryController,
} from "./categoryController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = express.Router();

const upload = getUploadMiddleware("category");

router.post(
  "/",
  verifyToken,
  // verifyPermission("category:create"),
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-category",
  }),
  createCategoryController
);

router.get(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-categories",
  }),
  getAllCategoriesController
);

router.get(
  "/grouped",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-grouped-industries-and-categories",
  }),
  getGroupedIndustriesAndCategoriesController
);

router.get(
  "/industry/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-categories-by-industry-id",
  }),
  getCategoriesByIndustryIdController
);

router.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-category-by-id",
  }),
  getCategoryByIdController
);

router.put(
  "/:id",
  verifyToken,
  // verifyPermission("category:update"),
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 10,
    keyPrefix: "update-category",
  }),
  updateCategoryController
);

router.delete(
  "/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 10,
    keyPrefix: "delete-category",
  }),
  deleteCategoryController
);

router.get(
  "/download-template/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 20,
    keyPrefix: "download-category-excel-template",
  }),
  downloadCategoryExcelTemplateController
);

router.post(
  "/bulkUpload",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 10,
    keyPrefix: "bulk-upload-category",
  }),
  upload.single("file"),
  categoryBulkUploadController
);

export default router;
