import express from "express";
import {
  createReviewController,
  getAllReviewsController,
  getReviewByIdController,
  getRatingSummaryController,
  updateReviewController,
} from "./productReviewController.js";
import getUploadMiddleware from "../../utils/multerConfig.js";
import verifyToken from "../../utils/verifyToken.js";

const route = express.Router();
const upload = getUploadMiddleware("reviews");

route.post("/", verifyToken, upload.single("image"), createReviewController);
route.get("/", getAllReviewsController);
route.get("/summary", getRatingSummaryController);
route.get("/:id", getReviewByIdController);
route.put("/:id", verifyToken, upload.none(), updateReviewController);

export default route;
