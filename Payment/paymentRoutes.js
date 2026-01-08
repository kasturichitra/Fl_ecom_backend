import { getAllPaymentGatewaysController, registerPaymentDocumentsController } from "./paymentController.js";
import { Router } from "express";

const router = Router();

router.get("/gateways", getAllPaymentGatewaysController);
router.post("/register/documents", registerPaymentDocumentsController); 

export default router;