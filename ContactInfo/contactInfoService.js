import { autoDeleteFromS3 } from "../lib/aws-s3/autoDeleteFromS3.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { sendEmail } from "../utils/sendOTP.js";
import validateContactInfo from "./validations/validateContactInfo.js";
import throwIfTrue from "../utils/throwIfTrue.js";

export const getContactInfoService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required.");
  const { contactInfoModelDB } = await getTenantModels(tenantId);
  return await contactInfoModelDB.findOne();
};

export const updateContactInfoService = async (tenantId, updateData, fileBuffer) => {
  throwIfTrue(!tenantId, "Tenant ID is required.");
  const { contactInfoModelDB } = await getTenantModels(tenantId);

  const existingInfo = await contactInfoModelDB.findOne();

  let logo_image = null;

  if (fileBuffer) {
    logo_image = await uploadImageVariants({
      fileBuffer,
      basePath: `${tenantId}/ContactInfo`,
    });
    console.log("😍 We are here");
    updateData.logo_image = logo_image;
  }

  if (existingInfo.logo_image && typeof existingInfo.logo_image === "object") {
    const urls = Object.values(existingInfo.logo_image).filter((u) => typeof u === "string");
    await Promise.all(urls.map(autoDeleteFromS3));
  }

  console.log("updateData", updateData);
  const { isValid, message } = validateContactInfo(updateData);
  throwIfTrue(!isValid, message);

  return await contactInfoModelDB.findOneAndUpdate(
    {},
    updateData,
    { new: true, upsert: true } // 🔥 auto create or update
  );
};

export const getInTouchService = async (tenantID, data) => {
  const { email } = data;

  const message = "welcome to Ntar";
  const subject = "Hi bro nice to meet you";

  throwIfTrue(!email, "email required");

  const result = await sendEmail(email, message, subject);

  return result;
};
