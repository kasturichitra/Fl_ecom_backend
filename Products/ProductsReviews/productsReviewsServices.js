import OrdersModel from "../../Orders/orderModel.js";
import throwIfTrue from "../../utils/throwIfTrue.js";
import ProductsModel from "../productModels.js";
import ProductsReviewsModel from "./productsReviewsModel.js";
import { validateReviewCreate } from "./validations/validateReviewCreate.js";
import { validateReviewUpdate } from "./validations/validateReviewUpdate.js";

//This function will create Reviews
export const createReviewsServices = async (tenantID, reviewsData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const { isValid, message } = validateReviewCreate(reviewsData);
  throwIfTrue(!isValid, message);

  const productModelDB = await ProductsModel(tenantID);
  const existingProduct = await productModelDB.findOne({
    products_unique_ID: reviewsData.products_unique_ID,
  });
  throwIfTrue(
    !existingProduct,
    `Product not found with given unique id ${reviewsData.products_unique_ID}`
  );

  const productReviewsModelDB = await ProductsReviewsModel(tenantID);
  let response = await productReviewsModelDB.create(reviewsData);

  const ordersModelDb = await OrdersModel(tenantID);

  const order = await ordersModelDb.findOne({
    user_ID: reviewsData.user_unique_ID,
    "products.products_unique_ID": reviewsData.products_unique_ID,
  });

  if (order) {
    response = await productReviewsModelDB.updateOne(
      { _id: response._id },
      { $set: { is_verified_purchase: true } }
    );
  }

  return response;
};

export const getAllReviewsServices = async (tenantID, filters) => {
  const {
    products_unique_ID,
    user_unique_ID,
    rating,
    min_rating,
    max_rating,
    is_verified_purchase,
    page = 1,
    limit = 10,
    sort, // like sort = rating:desc
  } = filters;

  const skip = (page - 1) * limit;

  throwIfTrue(!tenantID, "Tenant ID is required");

  const productReviewsModelDB = await ProductsReviewsModel(tenantID);

  const query = {};

  // Direct equal to queries
  if (products_unique_ID) query.products_unique_ID = products_unique_ID;
  if (user_unique_ID) query.user_unique_ID = user_unique_ID;
  if (rating) query.rating = Number(rating);
  if (is_verified_purchase) query.is_verified_purchase = is_verified_purchase;

  // Range related queries
  if (min_rating || max_rating) {
    query.rating = {};
    if (min_rating) query.rating.$gte = Number(min_rating);
    if (max_rating) query.rating.$lte = Number(max_rating);
  }

  // Sorting logic
  let sortObj = { createdAt: -1 }; // default
  if (sort) {
    sortObj = {};

    const sortFields = sort.split(",");
    // ["createdAt:desc", "price:asc"]

    for (const item of sortFields) {
      const [field, direction] = item.split(":");

      if (!field) continue;

      const order = direction === "asc" ? 1 : -1;

      sortObj[field] = order;
    }
  }

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
// export const getAllReviewsServices = async (tenantID) => {
//   try {
//     if (!tenantID) throw new Error("Tenant ID is required");

//     const productReviewsModeDB = await ProductsReviewsModel(tenantID);
//     const response = await productReviewsModeDB.find();
//     return response;
//   } catch (error) {
//     console.log("Get all reviews failed error=====>", error.message);
//     throw new Error("Get all reviews failed error===>" + error.message);
//   }
// };

//This function will get reviews based on Id
export const getReviewsByIdServices = async (tenantID, id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const productReviewsModelDB = await ProductsReviewsModel(tenantID);
  const response = await productReviewsModelDB.findById(id);

  return response;
};

//This function will update reviews based on Id
export const updateReviewsByIdServices = async (tenantID, id, updateReview) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!id, "Review ID is required");

  const { isValid, message } = validateReviewUpdate(updateReview);
  throwIfTrue(!isValid, message);

  const productReviewsModeDB = await ProductsReviewsModel(tenantID);
  const response = await productReviewsModeDB.findByIdAndUpdate(
    id,
    updateReview,
    { new: true, runValidators: true }
  );

  return response;
};
