


import express from "express";
import { getAllPaymentTransactions } from "./PaymentTransactionController.js";

const route = express.Router();

route.get("/", getAllPaymentTransactions);


export default route;