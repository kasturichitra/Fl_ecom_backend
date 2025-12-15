import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const deviceSessionSchema = new mongoose.Schema(
  {
    user_id: mongoose.Schema.Types.ObjectId,

    device_id: String, // from frontend
    device_name: String, // "Chrome on Windows"

    last_login_at: Date,

    expires_at: Date, // 🔥 device-specific expiry
    is_trusted: { type: Boolean, default: false },

    revoked_at: Date,
  },
  { timestamps: true }
);

deviceSessionSchema.index({ expires_at: 1 });

const deviceSessionModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.DeviceSession || db.model("DeviceSession", deviceSessionSchema);
};

export default deviceSessionModel;