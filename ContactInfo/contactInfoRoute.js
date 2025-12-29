import express from "express";

import verifyToken from "../utils/verifyToken.js";
import getUploadMiddleware from "../utils/multerConfig.js";
import { getContactInfo, getInTouchInfo, updateContactInfo } from "./contactInfoController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = express.Router();
const upload = getUploadMiddleware("contactInfo");

// Publicly accessible GET
router.get(
  "/",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-contact-info",
  }),
  getContactInfo
);

router.put(
  "/create",
  upload.single("logo_image"),
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-contact-info",
  }),
  updateContactInfo
);

router.post(
  "/getintouch",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "get-intouch-info",
  }),
  getInTouchInfo
);

export default router;
