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

// -----------------------------------
//  Compound Index
// -----------------------------------

// Ensures 1 user cannot insert duplicate product IDs
wishlistSchema.index({ user_id: 1, products: 1 }, { unique: false });

// For fast "check if product is in wishlist" queries
wishlistSchema.index({ user_id: 1, "products": 1 });


// -----------------------------------
// MODEL CREATION
// -----------------------------------
const WishlistModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Wishlist || db.model("Wishlist", wishlistSchema);
};

export default WishlistModel;


// import mongoose from "mongoose";
// import { getTenanteDB } from "../Config/tenantDB.js";

// const wishlistSchema = new mongoose.Schema(
//   {
//     user_id: {
//       type: String,
//       required: true,
//     },
//     products: [
//       {
//         type: String,
//         required: true,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const WishlistModel = async (tenantID) => {
//   const db = await getTenanteDB(tenantID);
//   return db.models.Wishlist || db.model("Wishlist", wishlistSchema);
// };

// export default WishlistModel;
