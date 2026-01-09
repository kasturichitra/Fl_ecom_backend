import { getAllPaymentGatewaysController, getPaymentDocumentsController, registerPaymentDocumentsController } from "./paymentController.js";
import { Router } from "express";

const router = Router();

router.get("/gateways", getAllPaymentGatewaysController);
router.get("/documents", getPaymentDocumentsController);

router.post("/register/documents", registerPaymentDocumentsController);


export default router;