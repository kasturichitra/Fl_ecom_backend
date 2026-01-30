import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const paymentTransactionSchema = new mongoose.Schema(
  {
    payment_status: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    payment_method: {
      type: String,
    },
    // Transaction reference Id is generated when order is created and hence it has to be unique and required
    transaction_reference_id: {
      type: String,
      trim: true,
      required: true, 
      unique: true
    }, 
    // Transaction id is what we will get from internal payment gateway
    transaction_id: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    order_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    gateway: {
      type: String,
    },
    gateway_code: {
      type: String,
    },
    // Gateway Reference Id
    gateway_reference_id: {
      type: String,
    },
    key_id: {
      type: String,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const PaymentTransactionsModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.PaymentTransactions || db.model("PaymentTransactions", paymentTransactionSchema);
};

export default PaymentTransactionsModel;
