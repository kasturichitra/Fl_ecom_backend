import { getTenantModels } from "../../lib/tenantModelsCache.js";
import throwIfTrue from "../../utils/throwIfTrue.js";

export const verifyOrderProducts = async (tenantId, products) => {
  // const Product = await ProductModel(tenantId);
  const { productModelDB } = await getTenantModels(tenantId);
  const result = await productModelDB.find({ product_unique_id: { $in: products.map((p) => p.product_unique_id) } });
  throwIfTrue(result.length !== products.length, `Some Products are not found`);
};
