import BrandModel from "../Brands/brandModel.js";
import { CategoryModel } from "../Category/categoryModel.js";

// tenantModelsCache.js
const tenantModelPromises = new Map();

export const getTenantModels = (tenantId) => {
  if (!tenantModelPromises.has(tenantId)) {
    const promise = (async () => {
      const brandModelDB = await BrandModel(tenantId);
      const categoryModelDB = await CategoryModel(tenantId);
      // Write remaining models here
      return { brandModelDB, categoryModelDB };
    })();

    tenantModelPromises.set(tenantId, promise);
  }

  return tenantModelPromises.get(tenantId);
};
