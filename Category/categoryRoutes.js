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

const router = express.Router();

const upload = getUploadMiddleware("category");

router.post(
  "/",
  verifyToken,
  // verifyPermission("category:create"),
  createCategoryController
);

router.get("/", getAllCategoriesController);
router.get("/grouped", getGroupedIndustriesAndCategoriesController);
router.get("/industry/:id", getCategoriesByIndustryIdController);
router.get("/:id", getCategoryByIdController);

router.put(
  "/:id",
  verifyToken,
  // verifyPermission("category:update"),
  updateCategoryController
);

router.delete("/:id", verifyToken, deleteCategoryController);

router.get("/download-template/:id", verifyToken, downloadCategoryExcelTemplateController);
router.post("/bulkUpload", verifyToken, upload.single("file"), categoryBulkUploadController);

export default router;
