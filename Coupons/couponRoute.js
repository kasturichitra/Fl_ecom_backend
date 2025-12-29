import express from "express";
import {
  createCouponController,
  deleteCouponController,
  generateUniqueCouponCodeController,
  getAllCouponsController,
  getByIdCouponController,
  updateCouponController,
} from "./couponController.js";
import verifyToken from "../utils/verifyToken.js";
import rateLimiter from "../lib/redis/rateLimiter.js";

const router = express.Router();

router.post(
  "/create",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "create-coupon",
  }),
  createCouponController
);

router.get(
  "/generate-code",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "generate-unique-coupon-code",
  }),
  generateUniqueCouponCodeController
);

router.get(
  "/",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-all-coupons",
  }),
  getAllCouponsController
);

router.get(
  "/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 60,
    keyPrefix: "get-coupon-by-id",
  }),
  getByIdCouponController
);

router.put(
  "/update/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "update-coupon",
  }),
  updateCouponController
);

router.delete(
  "/delete/:id",
  verifyToken,
  rateLimiter({
    windowSizeInSeconds: 60, // 1 minute
    maxRequests: 15,
    keyPrefix: "delete-coupon",
  }),
  deleteCouponController
);

export default router;
