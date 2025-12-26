import deviceSessionModel from "../Auth/deviceSessionModel.js";
import otpModel from "../Auth/otpModel.js";
import BrandModel from "../Brands/brandModel.js";
import CartModel from "../Cart/cartModel.js";
import { CategoryModel } from "../Category/categoryModel.js";
import OrdersModel from "../Orders/orderModel.js";
import ProductModel from "../Products/productModel.js";
import ProductReviewModel from "../Products/ProductsReviews/productReviewModel.js";
import SaleTrendModel from "../SaleTrend/saleTrendModel.js";
import UserModel from "../Users/userModel.js";
import WishlistModel from "../Wishlist/wishlistModel.js";
import { NotificationModel } from "../Notification/notificationModel.js";
import IndustryTypeModel from "../IndustryType/industryTypeModel.js";
// tenantModelsCache.js
const tenantModelPromises = new Map();

export const getTenantModels = (tenantId) => {
  if (!tenantModelPromises.has(tenantId)) {
    const promise = (async () => {
      const industryTypeModelDB = await IndustryTypeModel(tenantId);
      const brandModelDB = await BrandModel(tenantId);
      const categoryModelDB = await CategoryModel(tenantId);
      const productModelDB = await ProductModel(tenantId);
      const saleTrendModelDB = await SaleTrendModel(tenantId);
      const productReviewsModelDB = await ProductReviewModel(tenantId);
      const cartModelDB = await CartModel(tenantId);
      const wishlistModelDB = await WishlistModel(tenantId);
      const userModelDB = await UserModel(tenantId);
      const orderModelDB = await OrdersModel(tenantId);
      const otpModelDb = await otpModel(tenantId);
      const deviceSessionModelDB = await deviceSessionModel(tenantId);
      const notificationModelDB = await NotificationModel(tenantId);

      // Write remaining models here
      return {
        industryTypeModelDB,
        brandModelDB,
        categoryModelDB,
        productModelDB,
        saleTrendModelDB,
        productReviewsModelDB,
        cartModelDB,
        wishlistModelDB,
        userModelDB,
        orderModelDB,
        otpModelDb,
        deviceSessionModelDB,
        notificationModelDB,
      };
    })();

    tenantModelPromises.set(tenantId, promise);
  }

  return tenantModelPromises.get(tenantId);
};
