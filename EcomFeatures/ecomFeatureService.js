import axios from "axios";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getAllEcomFeaturesService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const { ecomFeatureModelDB } = await getTenantModels(tenantId);
  return await ecomFeatureModelDB.find();
};

/*
  Example JSON
  {
    "ecomFeatures": [
      {
        "featureId": "Feature-001", 
        "is_active": true, 
        "is_locked": true
      },
      {
        "featureId": "Feature-002", 
        "is_active": false, 
        "is_locked": false
      }
    ]
  }
*/
export const updateEcomFeaturesService = async (tenantId, payload) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!payload, "Payload is required");

  const { ecomFeatures } = payload;
  throwIfTrue(!Array.isArray(ecomFeatures), "Ecom Features must be an array");

  const { ecomFeatureModelDB } = await getTenantModels(tenantId);

  await ecomFeatureModelDB.deleteMany({});

  const updated = await ecomFeatureModelDB.insertMany(ecomFeatures);

  return updated;
};
