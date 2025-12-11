import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

export const addressSchema = new mongoose.Schema({
  name:{
    type: String,
    trim: true,
    required: true,
  },
  last_name:{
    type: String,
    trim: true,
    required: true,
  },
  mobile_number:{
    type: String,
    trim: true,
    required: true,
  },
  house_number: {
    type: String,
    trim: true,
    required: true,
  },
  street: {
    type: String,
    trim: true,
    required: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
    required: true,
  },
  district: {
    type: String,
    trim: true,
    required: true,
  },
  state: {
    type: String,
    trim: true,
    required: true,
  },
  postal_code: {
    type: String,
    trim: true,
    required: true,
  },
  country: {
    type: String,
    trim: true,
    required: true,
  },
});

const orderProductSchema = new mongoose.Schema({
  product_unique_id: {
    type: String,
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  // Base price (MRP) per unit
  unit_base_price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Discount amount per unit (subtracted from base price)
  unit_discount_price: {
    type: Number,
    default: 0,
  },
  // Tax value per unit (applied AFTER discount on the discounted amount)
  unit_tax_value: {
    type: Number,
    default: 0,
  },
  // Final price per unit: (base_price - discount_price) + tax_value (tax applied on discounted amount)
  unit_final_price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Total base price is base price * quantity
  total_base_price: {
    type: Number,
    required: true,
    min: 0,
  },
  // Total discount price is discount price * quantity
  total_discount_price: {
    type: Number,
    default: 0,
  },
  // Total tax value is tax value * quantity
  total_tax_value: {
    type: Number,
    default: 0,
  },
  // Total final price is final price * quantity
  total_final_price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      // required: true,
      trim: true,
    },
    order_id: {
      type: String,
      required: true,
    },
    order_type: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },
    // Move these OUT of the array
    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    payment_method: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet"],
      required: true,
    },
    cash_on_delivery: {
      type: Boolean,
      default: false,
    },
    transaction_id: {
      type: String,
      trim: true,
    },
    order_create_date: {
      type: Date,
      required: true,
    },
    order_cancel_date: { type: Date },
    order_status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
      default: "Pending",
    },

    // Customer details for offline orders
    customer_name: {
      type: String,
      trim: true,
    },
    mobile_number: {
      type: String,
      trim: true,
    },

    order_products: [
      {
        type: orderProductSchema,
        required: true,
      },
    ],

    address: addressSchema,
    base_price: { type: Number, required: true, min: 0 },
    tax_value: { type: Number, default: 0 },
    discount_price: { type: Number, default: 0 },
    total_amount: { type: Number, required: true, min: 0 },

    shipping_charges: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

const OrdersModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Orders || db.model("Orders", orderSchema);
};

export default OrdersModel;
