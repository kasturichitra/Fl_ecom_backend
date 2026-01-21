import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

/* ---------------------------------------------
   CREATE / ADD PRODUCT TO WISHLIST
----------------------------------------------*/
export const createWishlistServices = async (tenantID, user_id, product_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_id, "Product ID is required");

  const { wishlistModelDB, cartModelDB } = await getTenantModels(tenantID);
  // Check if product is already in wishlist
  const existingWishlist = await wishlistModelDB.findOne({ user_id, products: product_id });
  throwIfTrue(existingWishlist, "Product is already in wishlist");

  // Check if the product exist in cart and remove it from cart
  const existingCart = await cartModelDB.findOne({ user_id, "products.product_unique_id": product_id });
  // if (existingCart) await cartDB.findOneAndDelete({ user_id, "products.product_unique_id": product_id });
  // if (existingCart) {
  //   existingCart.products = existingCart.products.filter((item) => item.product_unique_id !== product_id);
  //   await existingCart.save();
  // }

  // Find and update in a single DB operation
  const wishlist = await wishlistModelDB.findOneAndUpdate(
    { user_id },
    { $addToSet: { products: product_id } }, // prevents duplicates automatically
    { upsert: true, new: true }, // create new if not exists
  );

  return wishlist;
};

/* ---------------------------------------------
   GET FULL PRODUCT DETAILS FROM WISHLIST
----------------------------------------------*/
export const getWishlistProductsServices = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const { wishlistModelDB, productModelDB } = await getTenantModels(tenantID);
  const wishlist = await wishlistModelDB.findOne({ user_id }).lean();

  if (!wishlist?.products?.length) return [];

  // Fast query by using only required fields
  const products = await productModelDB
    .find({ product_unique_id: { $in: wishlist.products }, is_active: true })
    .lean();

  return {
    data: products,
    totalCount: products.length,
  };
};

/* ---------------------------------------------
   GET USER WISHLIST (ONLY IDS)
----------------------------------------------*/
export const getWishlistServices = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const { wishlistModelDB } = await getTenantModels(tenantID);

  // Find only one wishlist, not array
  const wishlist = await wishlistModelDB.findOne({ user_id }).lean();

  return wishlist || { user_id, products: [] };
};

/* ---------------------------------------------
   REMOVE PRODUCT FROM WISHLIST
----------------------------------------------*/
export const removeWishlistServices = async (tenantID, user_id, product_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");
  throwIfTrue(!product_id, "Product ID is required");

  const { wishlistModelDB } = await getTenantModels(tenantID);

  const updated = await wishlistModelDB.findOneAndUpdate(
    { user_id },
    { $pull: { products: product_id } },
    { new: true },
  );

  throwIfTrue(!updated, "Wishlist not found for this user");

  return updated;
};

/* ---------------------------------------------
   MOVE WISHLIST TO CART
----------------------------------------------*/

export const moveWishlistToCartServices = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const { wishlistModelDB, cartModelDB } = await getTenantModels(tenantID);

  const wishlist = await wishlistModelDB.findOne({ user_id });
  throwIfTrue(!wishlist, "Wishlist not found for this user");

  const cart = await cartModelDB.findOne({ user_id });
  throwIfTrue(!cart, "Cart not found for this user");

  const cartProducts = wishlist.products.map((item) => ({ product_unique_id: item, quantity: 1 }));
  cart.products.push(...cartProducts);
  // wishlist.products = [];

  // await wishlist.save();
  await cart.save();

  return cart;
};

/* ---------------------------------------------
   CLEAR WISHLIST
----------------------------------------------*/

export const clearWishlistServices = async (tenantID, user_id) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!user_id, "User ID is required");

  const { wishlistModelDB } = await getTenantModels(tenantID);

  const wishlist = await wishlistModelDB.findOne({ user_id });

  throwIfTrue(!wishlist, "Wishlist not found for this user");

  wishlist.products = [];

  await wishlist.save();

  return wishlist;
};
