import express from "express";
import {
  createReviewsController,
  getAllReviewsController,
  getReviewsByIdController,
  // getReviewsBySearchController,
  updateReviewsByIdController,
} from "./productReviewController.js";
import getUploadMiddleware from "../../utils/multerConfig.js";

const route = express.Router();
const upload = getUploadMiddleware("reviews");

route.post(
  "/createReviews",
  //   verifyToken,
  upload.single("image"),
  createReviewsController
);
route.get(
  "/allReviews",
  // verifyToken,
  getAllReviewsController
);
route.get(
  "/getReviewsById/:id",
  // verifyToken,
  getReviewsByIdController
);
route.put(
  "/updateReviewsById/:id",
  upload.none(), 
  //  verifyToken,
  updateReviewsByIdController
);

export default route;
