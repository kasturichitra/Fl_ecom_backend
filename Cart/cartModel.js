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
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
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

const CartModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Cart || db.model("Cart", cartSchema);
};
export default CartModel;
