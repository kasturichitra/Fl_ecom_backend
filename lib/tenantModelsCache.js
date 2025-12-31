import deviceSessionModel from "../Auth/deviceSessionModel.js";
import otpModel from "../Auth/otpModel.js";
import BrandModel from "../Brands/brandModel.js";
import CartModel from "../Cart/cartModel.js";
import ConfigModel from "../Configs/configModel.js";
import { CategoryModel } from "../Category/categoryModel.js";
import OrdersModel from "../Orders/orderModel.js";
import ProductModel from "../Products/productModel.js";
import ProductReviewModel from "../Products/ProductsReviews/productReviewModel.js";
import SaleTrendModel from "../SaleTrend/saleTrendModel.js";
import UserModel from "../Users/userModel.js";
import WishlistModel from "../Wishlist/wishlistModel.js";
import { NotificationModel } from "../Notification/notificationModel.js";
import IndustryTypeModel from "../IndustryType/industryTypeModel.js";
import ContactInfoModel from "../ContactInfo/contactInfoModel.js";
import CouponModel from "../Coupons/couponModel.js";
import RoleModel from "../Role/roleModel.js";
import faqModel from "../FAQ/faqModel.js"; 

const tenantModelPromises = new Map();

export const getTenantModels = (tenantId) => {
  if (!tenantModelPromises.has(tenantId)) {
    const promise = (async () => {
      const industryTypeModelDB = await IndustryTypeModel(tenantId);
      const brandModelDB = await BrandModel(tenantId);
      const categoryModelDB = await CategoryModel(tenantId);
      const configModelDB = await ConfigModel(tenantId);
      const productModelDB = await ProductModel(tenantId);
      const saleTrendModelDB = await SaleTrendModel(tenantId);
      const productReviewsModelDB = await ProductReviewModel(tenantId);
      const cartModelDB = await CartModel(tenantId);
      const wishlistModelDB = await WishlistModel(tenantId);
      const userModelDB = await UserModel(tenantId);
      const orderModelDB = await OrdersModel(tenantId);
      const otpModelDB = await otpModel(tenantId);
      const deviceSessionModelDB = await deviceSessionModel(tenantId);
      const notificationModelDB = await NotificationModel(tenantId);
      const contactInfoModelDB = await ContactInfoModel(tenantId);
      const couponModelDB = await CouponModel(tenantId);
      const roleModelDB = await RoleModel(tenantId);
      const faqModelDB = await faqModel(tenantId);

      // Write remaining models here
      return {
        industryTypeModelDB,
        brandModelDB,
        categoryModelDB,
        configModelDB,
        productModelDB,
        saleTrendModelDB,
        productReviewsModelDB,
        cartModelDB,
        wishlistModelDB,
        userModelDB,
        orderModelDB,
        otpModelDB,
        deviceSessionModelDB,
        notificationModelDB,
        contactInfoModelDB,
        couponModelDB,
        roleModelDB,
        faqModelDB
      };
    })();

    tenantModelPromises.set(tenantId, promise);
  }

  return tenantModelPromises.get(tenantId);
};
