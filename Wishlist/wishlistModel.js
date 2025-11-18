import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    products: [
      {
        type: String, 
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const WishlistModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Wishlist || db.model("Wishlist", wishlistSchema);
};

export default WishlistModel;
