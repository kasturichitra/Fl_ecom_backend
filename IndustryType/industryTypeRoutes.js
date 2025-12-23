import express from "express";
import verifyToken from "../utils/verifyToken.js";
import {
  createIndustryTypeController,
  deleteIndustrytypeController,
  getIndustrysSearchController,
  //   getIndustrytypesController,
  updateIndustryTypeController,
} from "./industryTypeController.js";

const route = express.Router();

route.post(
  "/",
  verifyToken,
  createIndustryTypeController
);
route.put(
  "/:id",
  verifyToken,
  updateIndustryTypeController
);
route.get("/search", getIndustrysSearchController);
route.delete("/delete/:id", verifyToken, deleteIndustrytypeController);

// route.get("/", getIndustrytypesController);

export default route;
