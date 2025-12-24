import BrandModel from "../Brands/brandModel.js";
import { CategoryModel } from "../Category/categoryModel.js";
import ProductModel from "../Products/productModel.js";
import SaleTrendModel from "../SaleTrend/saleTrendModel.js";
// tenantModelsCache.js
const tenantModelPromises = new Map();

export const getTenantModels = (tenantId) => {
  if (!tenantModelPromises.has(tenantId)) {
    const promise = (async () => {
      const brandModelDB = await BrandModel(tenantId);
      const categoryModelDB = await CategoryModel(tenantId);
      const productModelDB = await ProductModel(tenantId);
      const saleTrendModelDB = await SaleTrendModel(tenantId);
      
      // Write remaining models here
      return { brandModelDB, categoryModelDB, productModelDB, saleTrendModelDB };
    })();

    tenantModelPromises.set(tenantId, promise);
  }

  return tenantModelPromises.get(tenantId);
};
