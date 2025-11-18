import express from "express";
import {
  createReviewController,
  getAllReviewsController,
  getReviewByIdController,
  // getReviewsBySearchController,
  updateReviewController,
} from "./productReviewController.js";
import getUploadMiddleware from "../../utils/multerConfig.js";

const route = express.Router();
const upload = getUploadMiddleware("reviews");

route.post("/", upload.single("image"), createReviewController);
route.get("/", getAllReviewsController);
route.get("/:id", getReviewByIdController);
route.put("/:id", upload.none(), updateReviewController);

export default route;
