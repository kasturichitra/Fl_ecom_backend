import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getAllEcomFeaturesService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const { ecomFeatureModelDB } = await getTenantModels(tenantId);
  return await ecomFeatureModelDB.find();
};

export const updateEcomFeaturesService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!payload, "Payload is required");

  const { ecomFeatures } = payload;
  throwIfTrue(!Array.isArray(ecomFeatures), "Ecom Features must be an array");

  const { ecomFeatureModelDB } = await getTenantModels(tenantId);

  // Remove existing features
  await ecomFeatureModelDB.deleteMany({});

  // Insert new features
  const docs = ecomFeatures.map((featureId) => ({ featureId: featureId.trim().toLowerCase() }));

  return await ecomFeatureModelDB.insertMany(docs);
};
