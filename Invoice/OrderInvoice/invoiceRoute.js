import express from "express";
import { generateInvoiceController } from "./invoiceController.js";
import rateLimiter from "../../lib/redis/rateLimiter.js";
import verifyToken from "../../utils/verifyToken.js";

const router = express.Router();

router.get(
  "/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "generate-invoice",
  }),
  generateInvoiceController
);

export default router;
