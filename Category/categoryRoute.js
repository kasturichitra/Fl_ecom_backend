import express from "express";
import getUploadMiddleware from "../utils/multerConfig.js";
import {
  categoryBulkUploadController,
  createCategoryController,
  deleteCategoryController,
  downloadCategoryExcelTemplateController,
  getAllCategoriesController,
  getCategoriesByIndustryIdController,
  getCategoryByIdController,
  updateCategoryController,
} from "./categoryController.js";

const route = express.Router();

const upload = getUploadMiddleware("category");

route.post("/", upload.single("image"), createCategoryController);
route.get("/", getAllCategoriesController);
route.get("/industry/:id", getCategoriesByIndustryIdController);
route.get("/:id", getCategoryByIdController);
route.put("/:id", upload.single("image"), updateCategoryController);
route.delete("/:id", deleteCategoryController);

route.get("/download-template/:id", downloadCategoryExcelTemplateController);
route.post("/bulkUpload", upload.single("file"), categoryBulkUploadController);
export default route;
