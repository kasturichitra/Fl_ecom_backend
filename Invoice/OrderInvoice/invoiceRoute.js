import express from "express";
import { generateInvoiceController } from "./invoiceController.js";



const router = express.Router();

router.get("/:id", generateInvoiceController);

export default router;