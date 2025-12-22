import express from "express";
import { createCouponController, deleteCouponController, generateUniqueCouponCodeController, getAllCouponsController, getByIdCouponController, updateCouponController } from "./couponController.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

router.post("/create", verifyToken, createCouponController);
router.get("/generate-code", verifyToken, generateUniqueCouponCodeController);
router.get("/", verifyToken, getAllCouponsController);
router.get("/:id", verifyToken, getByIdCouponController);
router.put("/update/:id", verifyToken, updateCouponController);
router.delete("/delete/:id", verifyToken, deleteCouponController);

export default router;
