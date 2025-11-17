import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import {
  createReviewsController,
  getAllReviewsController,
  getReviewsByIdController,
  // getReviewsBySearchController,
  updateReviewsByIdController,
} from "./productsReviewsController.js";
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
