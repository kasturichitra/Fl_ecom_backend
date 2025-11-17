import express from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoryController,
  getAllCategorySearchController,
  getCategoryByIdController,
  updateCategoryController,

} from "./categoryController.js";
import getUploadMiddleware from "../utils/multerConfig.js";



const route = express.Router();


const upload = getUploadMiddleware("category");

route.post("/addCategory", upload.single("image"), createCategoryController);
route.get("/getAllCategories", getAllCategoryController);
route.get("/getallCategorySearch", getAllCategorySearchController);
route.get("/getCategoryById/:id", getCategoryByIdController);
route.put("/updatecategory/:id", upload.single("image"), updateCategoryController);
route.delete("/deletecategory/:id", deleteCategoryController);

export default route;
