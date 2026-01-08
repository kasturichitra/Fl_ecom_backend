import { getAllPaymentGatewaysController } from "./paymentController.js";
import { Router } from "express";

const router = Router();

router.get("/gateways", getAllPaymentGatewaysController);

export default router;