import { gstinVerifyUrl } from "../env.js";
import axios from "axios";
import mongoose from "mongoose";
import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { uploadDocuments } from "../lib/aws-s3/uploadDocuments.js";
import generateBusinessId from "./utils/generateBusinessId.js";
import { sendBusinessApprovalEmailToAdmin, sendBusinessVerificationSuccessEmail } from "../utils/sendEmail.js";
import fs from "fs";

export const gstinVerifyService = async (payload) => {
  throwIfTrue(!payload.gst_in_number, "Gstin Number Required");
  throwIfTrue(!payload.business_name, "Business Name Required");

  const { data } = await axios.post(`${gstinVerifyUrl}/business/Gstinverify`, { gst_in_number: payload.gst_in_number });
  if (data.data.companyName.toLowerCase().trim() === payload.business_name.toLowerCase().trim()) {
    return data;
  } else {
    throwIfTrue(true, "Business Name Not Matched");
  }
};

export const addBusinessDetailsService = async (tenantId, user_id, businessData, files) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!user_id, "User ID is Required");
  throwIfTrue(!businessData.business_name, "Business Name is required");
  throwIfTrue(!businessData.gst_in_number, "GST Number is required");

  const { businessModelDB, userModelDB } = await getTenantModels(tenantId);

  const user = await userModelDB.findById(user_id);
  throwIfTrue(!user, "User not found");

  // Check if business with same GSTIN already exists
  const existingBusiness = await businessModelDB.findOne({ gst_in_number: businessData.gst_in_number });

  if (existingBusiness) {
    // If it exists and is not verified, maybe they are resubmitting?
    // Or if it's already verified, just return it or inform them.
    if (existingBusiness.is_verified) {
      // Update user with business_unique_id if not already set
      if (!user.business_unique_id) {
        user.business_unique_id = existingBusiness.business_unique_id;
        await user.save();
      }
      const res = user.toObject();
      delete res.password;
      return { message: "Business already exists and is verified", user: res };
    }
  }

  // Generate Business ID
  const business_unique_id = await generateBusinessId(businessModelDB);

  // Handle Images
  let imageUrls = [];
  if (files && files.images) {
    imageUrls = await Promise.all(
      files.images.map(async (file) => {
        const result = await uploadImageVariants({
          fileBuffer: fs.readFileSync(file.path),
          basePath: `businesses/${business_unique_id}/images`,
        });
        return { ...result, label: file.originalname };
      })
    );
  }

  // Handle Documents
  let documentUrls = [];
  if (files && files.documents) {
    documentUrls = await Promise.all(
      files.documents.map(async (file) => {
        const url = await uploadDocuments({
          fileBuffer: fs.readFileSync(file.path),
          basePath: `businesses/${business_unique_id}/documents`,
          originalName: file.originalname,
        });
        return { url, label: file.originalname };
      })
    );
  }

  // Create Business Document (Pending Approval)
  const newBusiness = new businessModelDB({
    ...businessData,
    user_id: user_id,
    business_unique_id,
    images: imageUrls,
    documents: documentUrls,
    is_verified: false,
    is_active: true,
  });

  await newBusiness.save();

  // Update User Model
  user.business_unique_id = business_unique_id;
  const updatedUser = await user.save();

  // Notify All Admins in Background
  backgroundEmailProcess(tenantId, {
    ...businessData,
    user_id,
    business_unique_id,
  });

  const res = updatedUser.toObject();
  delete res.password;

  return { message: "Business registration submitted for approval", user: res };
};

export const getAllBusinessDetailsService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  const { businessModelDB } = await getTenantModels(tenantId);
  return await businessModelDB.find({});
};

export const getAssignedBusinessDetailsService = async (tenantId, user_id) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!user_id, "User ID is Required");
  const { businessModelDB } = await getTenantModels(tenantId);

  console.log(`[DEBUG] Querying business for user_id: ${user_id} in tenant: ${tenantId}`);

  const businesses = await businessModelDB.find({ user_id });

  console.log(`[DEBUG] Found ${businesses} businesses`);
  return businesses;
};

export const getBusinessDetailsService = async (tenantId, business_id) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!business_id, "Business ID is Required");

  const { businessModelDB, userModelDB } = await getTenantModels(tenantId);

  const query = {
    $or: [{ business_unique_id: business_id }, { user_id: business_id }],
  };

  if (mongoose.Types.ObjectId.isValid(business_id)) {
    query.$or.push({ _id: business_id });
  }

  const business = await businessModelDB.findOne(query);
  throwIfTrue(!business, "Business not found");

  const user = await userModelDB.findOne({ _id: business.user_id });
  throwIfTrue(!user, "User not found for this business");

  return business;
};

export const updateBusinessDetailsService = async (tenantId, business_unique_id, updateData) => {
  // 🔒 Basic validations
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!business_unique_id, "Business ID is Required");

  const { businessModelDB } = await getTenantModels(tenantId);

  const business = await businessModelDB.findOne({ business_unique_id });

  throwIfTrue(!business, "Business not found");

  // ✅ Update verification date safely
  if ("is_verified" in updateData) {
    business.verification_date = updateData.is_verified ? new Date() : null;
  }

  // ✅ Update remaining fields
  Object.assign(business, updateData);

  await business.save();

  // 📧 Send Verification Success Email
  if (updateData.is_verified === true) {
    const { userModelDB } = await getTenantModels(tenantId);
    const user = await userModelDB.findById(business.user_id);
    if (user && user.email) {
      await sendBusinessVerificationSuccessEmail(user.email, business.business_name);
    }
  }

  return business;
};

export const deactivateBusinessService = async (tenantId, user_id, gst_in_number) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!user_id, "User ID is Required");
  throwIfTrue(!gst_in_number, "GSTIN Number is Required");

  const { businessModelDB, userModelDB } = await getTenantModels(tenantId);

  // Find the business and deactivate it
  const business = await businessModelDB.findOneAndUpdate(
    { user_id, gst_in_number },
    { is_active: false },
    { new: true }
  );
  throwIfTrue(!business, "Business not found for this user and GSTIN");

  // Update user account type to Personal
  const user = await userModelDB.findByIdAndUpdate(user_id, { account_type: "Personal" }, { new: true });
  throwIfTrue(!user, "User not found");

  const res = user.toObject();
  delete res.password;

  return { message: "Business deactivated and account type changed to Personal", user: res };
};

const backgroundEmailProcess = async (tenantId, businessData) => {
  try {
    const { userModelDB } = await getTenantModels(tenantId);

    // Fetch all active admins
    const admins = await userModelDB.find({ role: "admin", is_active: true }, "email");

    if (admins.length > 0) {
      await Promise.all(admins.map((admin) => sendBusinessApprovalEmailToAdmin(admin.email, businessData)));
      console.log(`Business approval emails sent to ${admins.length} admins.`);
    } else {
      console.log("No active admins found to notify for business approval.");
    }
  } catch (error) {
    console.error("Error in backgroundEmailProcess:", error.message);
  }
};
