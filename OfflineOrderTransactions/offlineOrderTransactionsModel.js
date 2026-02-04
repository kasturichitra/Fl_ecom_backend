import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const offlineOrderTransactionsSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    transaction_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

offlineOrderTransactionsSchema.index({ payment_method: 1 });

const OfflineOrderTransactionsModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.OfflineOrderTransactions || db.model("Offline_Order_Transactions", offlineOrderTransactionsSchema);
};

export default OfflineOrderTransactionsModel;
