import express from "express";
import {
  createIndustryTypeController,
  deleteIndustrytypeController,
  getIndustrysSearchController,
  //   getIndustrytypesController,
  updateIndustryTypeController,
} from "./industryTypeController.js";
import getUploadMiddleware from "../utils/multerConfig.js";
import verifyToken from "../utils/verifyToken.js";

const route = express.Router();

const upload = getUploadMiddleware("IndustryType");

route.post("/", verifyToken, upload.single("image"), createIndustryTypeController);
route.put("/:id", verifyToken, upload.single("image"), updateIndustryTypeController);
route.get("/search", getIndustrysSearchController);
route.delete("/delete/:id", verifyToken, deleteIndustrytypeController);

// route.get("/", getIndustrytypesController);

export default route;
