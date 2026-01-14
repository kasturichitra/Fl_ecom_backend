import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    is_system_role: {
      type: Boolean,
      default: false,
      // System roles (admin, employee, user) cannot be deleted
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
roleSchema.index({ name: 1 });

const RoleModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.Role || db.model("Role", roleSchema);
};

export default RoleModel;
