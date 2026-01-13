import {
  deletePaymentDocumentController,
  getAllPaymentGatewaysController,
  getPaymentDocumentByKeyIdController,
  getPaymentDocumentsController,
  getPaymentStatusController,
  initiatePaymentOrderController,
  registerPaymentDocumentsController,
  updatePaymentDocumentController,
} from "./paymentController.js";
import { Router } from "express";

const router = Router();

router.get("/gateways", getAllPaymentGatewaysController);

router.get("/documents", getPaymentDocumentsController);
router.get("/documents/:id", getPaymentDocumentByKeyIdController);
router.post("/documents", registerPaymentDocumentsController);
router.put("/documents/:id", updatePaymentDocumentController);
router.delete("/documents/:id", deletePaymentDocumentController);

router.post("/initiate", initiatePaymentOrderController);
router.get("/status/:id", getPaymentStatusController);
export default router;
