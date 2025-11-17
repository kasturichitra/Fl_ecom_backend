import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";



const orderSchema = new mongoose.Schema(
  {
    user_ID: {
      type: String,
      required: true,
      trim: true,
    },

    // Move these OUT of the array
    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    payment_method: {
      type: String,
      enum: ["COD", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet"],
      required: true,
    },
    transaction_id: {
      type: String,
      trim: true
    },
    order_create_date: {
      type: Date,
      required: true
    },
    order_cancel_date: { type: Date },

    order_Products: [
      {
        product_unique_ID: {
          type: String,
          required: true
        },
        product_name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true, min: 1
        },
        price: {
          type: Number,
          required: true, min: 0
        },
        discount_price: {
          type: Number,
          default: 0
        },
        total_price: {
          type: Number,
          required: true,
          min: 0
        },
        tax_amount: {
          type: Number,
          default: 0
        },
        status: {
          type: String,
          enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
          default: "Pending",
        },
        delivered_at: { type: Date },
        cancelled_at: { type: Date },
      },
    ],
    address: {
      type: Object,
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    shipping_charges: { type: Number, default: 0 },
    total_amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);
const OrdersModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Orders || db.model("Orders", orderSchema);
};

export default OrdersModel;



// const orderSchema = new mongoose.Schema(
//   {
//     // order_unique_ID: {
//     //   type: String,
//     //   required: true,
//     //   unique: true,
//     // },
//     user_ID: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     order_Products: [
//       {
//         product_unique_ID: {
//           type: String,
//           required: true
//         },
//         product_name: {
//           type: String,
//           required: true
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1
//         },
//         price: {
//           type: Number,
//           required: true,
//           min: 0
//         },
//         discount_price: {
//           type: Number,
//           default: 0
//         },
//         total_price: {
//           type: Number,
//           required: true,
//           min: 0
//         },
//         tax_amount: {
//           type: Number,
//           default: 0
//         },
//         status: {
//           type: String,
//           enum: [
//             "Pending",
//             "Processing",
//             "Shipped",
//             "Delivered",
//             "Cancelled",
//             "Returned",
//           ],
//           default: "Pending",
//         },
//         payment_status: {
//           type: String,
//           enum: ["Pending", "Paid", "Failed", "Refunded"],
//           default: "Pending",
//         },
//         payment_method: {
//           type: String,
//           enum: ["COD", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet"],
//           required: true,
//         },
//         transaction_id: { type: String, trim: true },

//         order_create_date: {
//           type: Date,
//           required: true
//         },
//         order_cancel_date: {
//           type: Date,
//         }
//       },
//     ],
//     subtotal: {
//       type: Number,
//       required: true,
//       min: 0
//     },

//     shipping_charges: {
//       type: Number,
//       default: 0
//     },
//     total_amount: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     currency: {
//       type: String,
//       default: "INR"
//     },
//     delivered_at: { type: Date },
//     cancelled_at: { type: Date },
//   },
//   { timestamps: true }
// );
