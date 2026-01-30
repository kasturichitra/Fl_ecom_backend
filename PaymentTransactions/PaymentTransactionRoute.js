


import express from "express";
import { getAllPaymentTransactions, getPaymentTransactionByIdController } from "./PaymentTransactionController.js";

const route = express.Router();

route.get("/", getAllPaymentTransactions);
route.get("/:id", getPaymentTransactionByIdController);



export default route;