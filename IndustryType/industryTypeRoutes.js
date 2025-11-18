import express from "express";
import {
  createIndustryTypeController,
  deleteIndustrytypeController,
  getIndustrysSearchController,
  //   getIndustrytypesController,
  updateIndustryTypeController,
} from "./industryTypeController.js";
import getUploadMiddleware from "../utils/multerConfig.js";

const route = express.Router();

const upload = getUploadMiddleware("IndustryType");

route.post("/", upload.single("image"), createIndustryTypeController);
route.put("/:id", upload.single("image"), updateIndustryTypeController);
route.get("/search", getIndustrysSearchController);
route.delete("/delete/:id", deleteIndustrytypeController);

// route.get("/", getIndustrytypesController);

export default route;
