import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";
import { addressSchema } from "../Orders/orderModel.js";


const couponSchema = new mongoose.Schema({
  coupon_code: {
    type: String,
  },
  useage_count: {
    type: Number,
    default: 0,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    date_of_birth: {
      type: Date,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^\d{10,15}$/, "Please provide a valid phone number"],
    },
    // Branch name means which branch employee is operating from.
    branch_name: {
      type: String,
    },
    // User means end customer who will use this app or e commerce website.
    // DEPRECATED: Legacy role field - now using role_id reference
    role: {
      type: String,
      enum: ["admin", "employee", "user"],
      default: "user",
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      // If not set, falls back to legacy 'role' field
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
    fcm_token: {
      type: String,
    },
    address: [addressSchema],
    useage_coupon: {
      type: [couponSchema]
    }
  },
  { timestamps: true }
);

const UserModel = async (tenateID) => {
  const db = await getTenanteDB(tenateID);
  return db.models.User || db.model("User", userSchema);
};

export default UserModel;
