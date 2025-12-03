import ProductModel from "../Products/productModel.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import WishlistModel from "./wishlistModel.js";

/* ---------------------------------------------
   CREATE / ADD PRODUCT TO WISHLIST
----------------------------------------------*/
export const createWishlistServices = async (tenantID, user_id, product_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_id, "Product ID is required");

  const wishlistDB = await WishlistModel(tenantID);

  // Find and update in a single DB operation
  const wishlist = await wishlistDB.findOneAndUpdate(
    { user_id },
    { $addToSet: { products: product_id } }, // prevents duplicates automatically
    { upsert: true, new: true } // create new if not exists
  );

  return wishlist;
};

/* ---------------------------------------------
   GET FULL PRODUCT DETAILS FROM WISHLIST
----------------------------------------------*/
export const getWishlistProductsServices = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const wishlistDB = await WishlistModel(tenantID);
  const productDB = await ProductModel(tenantID);

  const wishlist = await wishlistDB.findOne({ user_id }).lean();

  if (!wishlist?.products?.length) return [];

  // Fast query by using only required fields
   const products = await productDB.find(
    { product_unique_id: { $in: wishlist.products } }
  ).lean();

  return {
    data: products, 
    totalCount: wishlist.products.length, 
  };
};

/* ---------------------------------------------
   GET USER WISHLIST (ONLY IDS)
----------------------------------------------*/
export const getWishlistServices = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const wishlistDB = await WishlistModel(tenantID);

  // Find only one wishlist, not array
  const wishlist = await wishlistDB.findOne({ user_id }).lean();

  return wishlist || { user_id, products: [] };
};

/* ---------------------------------------------
   REMOVE PRODUCT FROM WISHLIST
----------------------------------------------*/
export const removeWishlistServices = async (tenantID, user_id, product_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_id, "Product ID is required");

  const wishlistDB = await WishlistModel(tenantID);

  const updated = await wishlistDB.findOneAndUpdate(
    { user_id },
    { $pull: { products: product_id } },
    { new: true }
  );

  throwIfTrue(!updated, "Wishlist not found for this user");

  return updated;
};



export const clearWishlistServices = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const wishlistDB = await WishlistModel(tenantID);

  const wishlist= await wishlistDB.findOne({ user_id });

  throwIfTrue(!wishlist, "Wishlist not found for this user");

  wishlist.products = [];

  await wishlist.save();

  return wishlist;
};