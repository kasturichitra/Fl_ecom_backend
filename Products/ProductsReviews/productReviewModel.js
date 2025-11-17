import mongoose from "mongoose";
import { getTenanteDB } from "../../Config/tenantDB.js";

const productReviewSchema = new mongoose.Schema(
  {
    // review_unique_ID: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    products_unique_ID: {
      type: String,
      required: true,
    },
    user_unique_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_name: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Good, Bad, Ugly, Impressive etc.. !
    title: {
      type: String,
      trim: true,
    },
    // Long description
    comment: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    is_verified_purchase: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "published", "hidden", "removed"],
      default: "pending",
    },
    // videos: {
    //   type: [String],
    //   default: [],
    // },
    // likes_count: {
    //   type: Number,
    //   default: 0,
    // },
    // dislikes_count: {
    //   type: Number,
    //   default: 0,
    // },
    // reported: {
    //   type: Boolean,
    //   default: false,
    // },
    // report_reason: {
    //   type: String,
    //   trim: true,
    // },
  },
  { timestamps: true },
);

const ProductsReviewsModel = async (tenateID) => {
  const db = await getTenanteDB(tenateID);
  return (
    db.models.ProductsReviews ||
    db.model("ProductsReviews", productReviewSchema)
  );
};

export default ProductsReviewsModel;
