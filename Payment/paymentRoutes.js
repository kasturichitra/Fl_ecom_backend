import {
  getAllPaymentGatewaysController,
  getPaymentDocumentsController,
  registerPaymentDocumentsController,
  updatePaymentDocumentController,
} from "./paymentController.js";
import { Router } from "express";

const router = Router();

router.get("/gateways", getAllPaymentGatewaysController);

router.get("/documents", getPaymentDocumentsController);
router.post("/documents", registerPaymentDocumentsController);
router.put("/documents/:id", updatePaymentDocumentController);

export default router;
