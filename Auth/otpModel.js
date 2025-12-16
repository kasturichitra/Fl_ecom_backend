import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const otpSchema = new mongoose.Schema(
  {
    user_id: mongoose.Schema.Types.ObjectId,
    device_id: String,
    purpose: {
      type: String,
      enum: ["NEW_DEVICE", "DEVICE_SESSION_EXPIRED", "SIGN_UP", "FORGOT_PASSWORD"],
    },
    otp_hash: String,
    expires_at: Date,
    consumed_at: Date,
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expires_at: 1 });

const otpModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.Otp || db.model("Otp", otpSchema);
};

export default otpModel;
