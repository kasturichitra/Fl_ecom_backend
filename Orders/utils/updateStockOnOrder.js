import { getTenantModels } from "../../lib/tenantModelsCache.js";

//    Decrease product stock (called after order is saved)
export const updateStockOnOrder = async (tenantId, products) => {
  // const Product = await ProductModel(tenantId);
  const { productModelDB } = await getTenantModels(tenantId);

  const bulkOps = products.map((item) => ({
    updateOne: {
      filter: { product_unique_id: item.product_unique_id },
      update: { $inc: { stock_quantity: -item.quantity } },
    },
  }));

  if (bulkOps.length) await productModelDB.bulkWrite(bulkOps);
};
