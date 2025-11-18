import ProductsModel from "../Products/productModel.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import WishlistModel from "./wishlistModel.js";

export const wishlistCreateServices = async (tenantID, user_id, product_id) => {
    throwIfTrue(!tenantID, "Tenant ID is required");
    throwIfTrue(!user_id, "User ID is required");
    throwIfTrue(!product_id, "Product ID is required");

    const wishlistModelDB = await WishlistModel(tenantID);

    let wishlist = await wishlistModelDB.findOne({ user_id });

    if (!wishlist) {
      wishlist = await wishlistModelDB.create({
        user_id,
        products: [product_id],
      });
    } else {
      if (!wishlist.products.includes(product_id)) {
        wishlist.products.push(product_id);
        await wishlist.save();
      }
    }

    return wishlist;

};





export const getWishlistProductServices = async (tenantID, user_id) => {
    throwIfTrue(!tenantID, "Tenant ID is required");
    throwIfTrue(!user_id, "User ID is required");

    const wishlistModelDB = await WishlistModel(tenantID);
    const productModelDB = await ProductsModel(tenantID);

    const wishlist = await wishlistModelDB.findOne({ user_id });
    
    if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
      return [];
    }

    const products = await productModelDB.find({
      products_unique_ID: { $in: wishlist.products },
    });

    return products;

};



export const getWishlistServices = async (tenantID, user_id) => {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!user_id) throw new Error("User ID is required");

    const wishlistModelDB = await WishlistModel(tenantID);

    const response = await wishlistModelDB.find({ user_id });

    return response;

};



export const removeWishlistServices = async (tenantID, user_id, product_id) => {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!user_id) throw new Error("User ID is required");
    if (!product_id) throw new Error("Product ID is required");

    const wishlistModelDB = await WishlistModel(tenantID);

    const updatedWishlist = await wishlistModelDB.findOneAndUpdate(
      { user_id },
      { $pull: { products: product_id } },
      { new: true }
    );

    if (!updatedWishlist) throw new Error("Wishlist not found for this user");

    return updatedWishlist;

};
