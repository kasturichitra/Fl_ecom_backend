import fs from "fs";
import path from "path";
import ContactInfoModel from "./contactInfoModel.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getContactInfoService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required.");
  const ContactInfoDB = await ContactInfoModel(tenantId);
  return await ContactInfoDB.findOne();
};

export const updateContactInfoService = async (tenantId, updateData) => {
  throwIfTrue(!tenantId, "Tenant ID is required.");
  const ContactInfoDB = await ContactInfoModel(tenantId);

  const existingInfo = await ContactInfoDB.findOne();

  if (existingInfo?.logo_image && updateData.logo_image && existingInfo.logo_image !== updateData.logo_image) {
    const oldImagePath = path.resolve(existingInfo.logo_image);
    fs.existsSync(oldImagePath) && fs.unlinkSync(oldImagePath);
  }

  return await ContactInfoDB.findOneAndUpdate(
    {},
    updateData,
    { new: true, upsert: true } // 🔥 auto create or update
  );
};
