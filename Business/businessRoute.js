import express from "express";
import { addBusinessDetailsController, deactivateBusinessController, getBusinessDetailsController, gstinVerifyController } from "./businessController.js";
import getUploadMiddleware from "../utils/multerConfig.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

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
    { name: "documents", maxCount: 5 }
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




router.get("/details/:id",
  rateLimiter({
    windowSizeInSeconds: 60,
    maxRequests: 15,
    keyPrefix: "get-business-details",
  }),
  getBusinessDetailsController);

export default router;
