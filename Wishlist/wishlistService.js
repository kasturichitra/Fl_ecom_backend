import ProductsModel from "../Products/productModel.js";
import WishlistModel from "./wishlistModel.js";

export const wishlistCreateServices = async (tenantID, user_ID, product_ID) => {
  // try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!user_ID) throw new Error("User ID is required");
    if (!product_ID) throw new Error("Product ID is required");

    const wishlistModelDB = await WishlistModel(tenantID);

    let wishlist = await wishlistModelDB.findOne({ user_ID });

    if (!wishlist) {
      wishlist = await wishlistModelDB.create({
        user_ID,
        products: [product_ID],
      });
    } else {
      if (!wishlist.products.includes(product_ID)) {
        wishlist.products.push(product_ID);
        await wishlist.save();
      }
    }

    return wishlist;
  // } catch (error) {
  //   console.error("Wishlist creation failed ===>", error.message);
  //   throw new Error(error.message);
  // }
};





export const getWishlistProductsServices = async (tenantID, user_ID) => {
  // try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!user_ID) throw new Error("User ID is required");

    const wishlistModelDB = await WishlistModel(tenantID);
    const productModelDB = await ProductsModel(tenantID);

    const wishlist = await wishlistModelDB.findOne({ user_ID });

    console.log(wishlist,'wishlist');
    
    if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
      return [];
    }

    const products = await productModelDB.find({
      products_unique_ID: { $in: wishlist.products },
    });

    return products;
  // } catch (error) {
  //   console.error("getWishlistProductsServices error ===>", error.message);
  //   throw new Error(error.message);
  // }
};



export const getWishlistServices = async (tenantID, user_ID) => {
  // try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!user_ID) throw new Error("User ID is required");

    const wishlistModelDB = await WishlistModel(tenantID);

    const response = await wishlistModelDB.find({ user_ID });

    return response;
  // } catch (error) {
  //   console.error("getWishlistServices error ===>", error.message);
  //   throw new Error(error.message);
  // }
};



export const removeWishlistServices = async (tenantID, user_ID, product_ID) => {
  // try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!user_ID) throw new Error("User ID is required");
    if (!product_ID) throw new Error("Product ID is required");

    const wishlistModelDB = await WishlistModel(tenantID);

    const updatedWishlist = await wishlistModelDB.findOneAndUpdate(
      { user_ID },
      { $pull: { products: product_ID } },
      { new: true }
    );

    if (!updatedWishlist) throw new Error("Wishlist not found for this user");

    return updatedWishlist;
  // } catch (error) {
  //   console.error("removeWishlistServices error ===>", error.message);
  //   throw new Error(error.message);
  // }
};
