import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Permission key is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z]+:[a-z_]+$/, "Permission key must follow format: 'resource:action' (e.g., 'product:create')"],
    },
    description: {
      type: String,
      required: [true, "Permission description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Permission category is required"],
      trim: true,
      // Examples: Products, Orders, Users, Categories, Brands, etc.
    },
    is_system: {
      type: Boolean,
      default: false,
      // System permissions cannot be deleted
    },
  },
  { timestamps: true }
);

// Index for faster queries
permissionSchema.index({ key: 1 });
permissionSchema.index({ category: 1 });

const PermissionModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.Permission || db.model("Permission", permissionSchema);
};

export default PermissionModel;
