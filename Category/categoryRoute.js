import express from "express";
import getUploadMiddleware from "../utils/multerConfig.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController
} from "./categoryController.js";

const route = express.Router();

const upload = getUploadMiddleware("category");

route.post("/", upload.single("image"), createCategoryController);
route.get("/", getAllCategoriesController);
route.get("/:id", getCategoryByIdController);
route.put("/:id", upload.single("image"), updateCategoryController);
route.delete("/:id", deleteCategoryController);

export default route;
