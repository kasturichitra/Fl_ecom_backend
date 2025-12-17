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

const route = express.Router();

const upload = getUploadMiddleware("category");

route.post("/", verifyToken, upload.single("image"), createCategoryController);
route.get("/", getAllCategoriesController);
route.get("/grouped", getGroupedIndustriesAndCategoriesController);
route.get("/industry/:id", getCategoriesByIndustryIdController);
route.get("/:id", getCategoryByIdController);
route.put("/:id", verifyToken, upload.single("image"), updateCategoryController);
route.delete("/:id", verifyToken, deleteCategoryController);

route.get("/download-template/:id", verifyToken, downloadCategoryExcelTemplateController);
route.post("/bulkUpload", verifyToken, upload.single("file"), categoryBulkUploadController);
export default route;
