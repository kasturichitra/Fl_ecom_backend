import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  postal_code: String,
  country: String,
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
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10,15}$/, "Please provide a valid phone number"],
    },
    // Branch name means which branch employee is operating from. 
    branch_name: {
      type: String, 
    }, 
    // User means end customer who will use this app or e commerce website.
    role: {
      type: String,
      enum: ["admin", "employee", "user"],
      default: "user",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
    address: [addressSchema],
  },
  { timestamps: true }
);

const UserModel = async (tenateID) => {
  const db = await getTenanteDB(tenateID);
  return db.models.User || db.model("User", userSchema);
};

export default UserModel;
