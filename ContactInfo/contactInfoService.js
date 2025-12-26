import fs from "fs";
import path from "path";
import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";

export const getContactInfoService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required.");
  const { contactInfoModelDB } = await getTenantModels(tenantId);
  return await contactInfoModelDB.findOne();
};

export const updateContactInfoService = async (tenantId, updateData) => {
  throwIfTrue(!tenantId, "Tenant ID is required.");
  const { contactInfoModelDB } = await getTenantModels(tenantId);

  const existingInfo = await contactInfoModelDB.findOne();

  if (existingInfo?.logo_image && updateData.logo_image && existingInfo.logo_image !== updateData.logo_image) {
    const oldImagePath = path.resolve(existingInfo.logo_image);
    fs.existsSync(oldImagePath) && fs.unlinkSync(oldImagePath);
  }

  return await contactInfoModelDB.findOneAndUpdate(
    {},
    updateData,
    { new: true, upsert: true } // 🔥 auto create or update
  );
};
