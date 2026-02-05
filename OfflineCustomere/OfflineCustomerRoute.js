import { Router } from "express";
import { getByCustomerInfoCController } from "./OfflineCustomerController.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = Router();

router.get(
  "/:mobile_number",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-offline-customer-info",
  }),
  getByCustomerInfoCController,
);

export default router;
