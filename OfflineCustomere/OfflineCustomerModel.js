import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const offlineCustomereSchema = new mongoose.Schema(
  {
    customer_id: {
      type: String,
      required: true,
    },
    customer_name: {
      type: String,
      trim: true,
    },
    mobile_number: {
      type: String,
      trim: true,
    },
    offline_address: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

offlineCustomereSchema.index({ customer_name: 1 });
offlineCustomereSchema.index({ mobile_number: 1 });

const OfflineCustomerModel = async (tenantId) => {
  const tenantDB = await getTenanteDB(tenantId);
  return tenantDB.model("OfflineCustomers", offlineCustomereSchema);
};

export default OfflineCustomerModel;