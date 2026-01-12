import express from "express";
import rateLimiter from "../lib/redis/rateLimiter.js";
import getUploadMiddleware from "../utils/multerConfig.js";
import {
  addBusinessDetailsController,
  deactivateBusinessController,
  getAllBusinessDetailsController,
  getBusinessDetailsController,
  gstinVerifyController,
  assignBusinessDetailsController,
  getByBusinessIdController,
} from "./businessController.js";

const router = express.Router();
const upload = getUploadMiddleware("business");

router.post("/gstinverify", gstinVerifyController);

router.post(
  "/details/:id",
  rateLimiter({
    windowSizeInSeconds: 60,
    maxRequests: 15,
    keyPrefix: "add-business-details",
  }),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 5 },
  ]),
  addBusinessDetailsController
);

router.put(
  "/deactivate/:id/:getinumber",
  rateLimiter({
    windowSizeInSeconds: 60,
    maxRequests: 15,
    keyPrefix: "deactivate-business",
  }),
  deactivateBusinessController
);

router.get(
  "/allBusinessDetails",
  rateLimiter({
    windowSizeInSeconds: 60,
    maxRequests: 15,
    keyPrefix: "get-all-business-details",
  }),
  getAllBusinessDetailsController
);

router.get(
  "/details/:id",
  rateLimiter({
    windowSizeInSeconds: 60,
    maxRequests: 15,
    keyPrefix: "get-business-details",
  }),
  getBusinessDetailsController
);

router.get(
  "/getBusinessDetails/:id",
  rateLimiter({
    windowSizeInSeconds: 60,
    maxRequests: 15,
    keyPrefix: "get-business-details",
  }),
  getByBusinessIdController
);

router.put(
  "/assign/:id",
  rateLimiter({
    windowSizeInSeconds: 60,
    maxRequests: 15,
    keyPrefix: "assign-business-details",
  }),
  assignBusinessDetailsController
);

export default router;
