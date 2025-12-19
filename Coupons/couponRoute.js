import express from "express";
import { createCouponController, generateUniqueCouponCodeController, getAllCouponsController, updateCouponController } from "./couponController.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createCouponController);
router.get("/generate-code", verifyToken, generateUniqueCouponCodeController);
router.get("/", verifyToken, getAllCouponsController);
router.put("/update/:id", verifyToken, updateCouponController);

export default router;
