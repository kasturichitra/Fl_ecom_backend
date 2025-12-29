import express from "express";
import {
  createReviewController,
  getAllReviewsController,
  getReviewByIdController,
  getRatingSummaryController,
  updateReviewController,
} from "./productReviewController.js";
import verifyToken from "../../utils/verifyToken.js";

const route = express.Router();

route.post(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-review",
  }),
  verifyToken,
  // upload.single("image"),
  createReviewController
);

route.get(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-reviews",
  }),
  getAllReviewsController
);

route.get(
  "/summary",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-rating-summary",
  }),
  getRatingSummaryController
);

route.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-review-by-id",
  }),
  getReviewByIdController
);

route.put(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-review",
  }),
  verifyToken,
  //  upload.none(),
  updateReviewController
);

export default route;
