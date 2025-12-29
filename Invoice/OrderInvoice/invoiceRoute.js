import express from "express";
import { generateInvoiceController } from "./invoiceController.js";
import rateLimiter from "../../lib/redis/rateLimiter.js";

const router = express.Router();

router.get(
  "/:id",
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "generate-invoice",
  }),
  generateInvoiceController
);

export default router;
