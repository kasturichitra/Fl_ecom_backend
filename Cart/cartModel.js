import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product_unique_id: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ user_id: 1 });

const CartModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Cart || db.model("Cart", cartSchema);
};
export default CartModel;
