import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const wishlistSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,                 // super-fast user wishlist fetch
    },

    products: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,             // removes __v
    strict: true,                  // prevents unwanted fields
  }
);

// For fast "check if product is in wishlist" queries
wishlistSchema.index({ user_id: 1, "products": 1 });


const WishlistModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Wishlist || db.model("Wishlist", wishlistSchema);
};

export default WishlistModel;
