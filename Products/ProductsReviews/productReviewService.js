import OrdersModel from "../../Orders/orderModel.js";
import { buildSortObject } from "../../utils/buildSortObject.js";
import throwIfTrue from "../../utils/throwIfTrue.js";
import ProductModel from "../productModel.js";
import ProductReviewModel from "./productReviewModel.js";
import { validateReviewCreate } from "./validations/validateReviewCreate.js";
import { validateReviewUpdate } from "./validations/validateReviewUpdate.js";

//This function will create Reviews
export const createReviewService = async (tenantId, reviewsData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const { isValid, message } = validateReviewCreate(reviewsData);
  throwIfTrue(!isValid, message);

  const productModelDB = await ProductModel(tenantId);
  const existingProduct = await productModelDB.findOne({
    product_unique_id: reviewsData.product_unique_id,
  });
  throwIfTrue(
    !existingProduct,
    `Product not found with given unique id ${reviewsData.product_unique_id}`
  );

  const productReviewsModelDB = await ProductReviewModel(tenantId);
  let response = await productReviewsModelDB.create(reviewsData);

  const ordersModelDb = await OrdersModel(tenantId);

  const order = await ordersModelDb.findOne({
    user_id: reviewsData.user_unique_id,
    "products.product_unique_id": reviewsData.product_unique_id,
  });

  if (order) {
    response = await productReviewsModelDB.updateOne(
      { _id: response._id },
      { $set: { is_verified_purchase: true } }
    );
  }

  return response;
};

export const getAllReviewsService = async (tenantId, filters) => {
  const {
    product_unique_id,
    user_unique_id,
    rating,
    min_rating,
    max_rating,
    is_verified_purchase,
    page = 1,
    limit = 10,
    sort, // like sort = rating:desc
  } = filters;

  const skip = (page - 1) * limit;

  throwIfTrue(!tenantId, "Tenant ID is required");

  const productReviewsModelDB = await ProductReviewModel(tenantId);

  const query = {};

  // Direct equal to queries
  if (product_unique_id) query.product_unique_id = product_unique_id;
  if (user_unique_id) query.user_unique_id = user_unique_id;
  if (rating) query.rating = Number(rating);
  if (is_verified_purchase) query.is_verified_purchase = is_verified_purchase;

  // Range related queries
  if (min_rating || max_rating) {
    query.rating = {};
    if (min_rating) query.rating.$gte = Number(min_rating);
    if (max_rating) query.rating.$lte = Number(max_rating);
  }

  // Sorting logic
  const sortObj = buildSortObject(sort);

  console.log("Query before going to db ===>", query);
  const reviews = await productReviewsModelDB
    .find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit));

  const totalCount = await productReviewsModelDB.countDocuments(query);

  return {
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    reviews,
  };
};

//This function will get all reviews data
// export const getAllReviewsServices = async (tenantId) => {
//   try {
//     if (!tenantId) throw new Error("Tenant ID is required");

//     const productReviewsModeDB = await ProductReviewModel(tenantId);
//     const response = await productReviewsModeDB.find();
//     return response;
//   } catch (error) {
//     console.log("Get all reviews failed error=====>", error.message);
//     throw new Error("Get all reviews failed error===>" + error.message);
//   }
// };

//This function will get reviews based on Id
export const getReviewByIdService = async (tenantId, product_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");

  const productReviewsModelDB = await ProductReviewModel(tenantId);
  const response = await productReviewsModelDB.find({ product_unique_id });

  return response;
};

//This function will update reviews based on Id
export const updateReviewService = async (tenantId, id, updateReview) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!id, "Review ID is required");

  const { isValid, message } = validateReviewUpdate(updateReview);
  throwIfTrue(!isValid, message);

  const productReviewsModelDB = await ProductReviewModel(tenantId);
  const response = await productReviewsModelDB.findByIdAndUpdate(
    id,
    updateReview,
    { new: true, runValidators: true }
  );

  return response;
};
