import axios from "axios";
import fs from "fs";
import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { gstinVerifyUrl } from "../env.js";
import generateBusinessId from "./utils/generateBusinessId.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { uploadDocuments } from "../lib/aws-s3/uploadDocuments.js";
import mongoose from "mongoose";
import { sendBusinessVerificationSuccessEmail } from "../utils/sendEmail.js";

export const gstinVerifyService = async (payload) => {
  throwIfTrue(!payload.gst_in_number, "Gstin Number Required");
  throwIfTrue(!payload.business_name, "Business Name Required");
  console.log("gstinVerifyUrl", gstinVerifyUrl);

  try {
    const { data } = await axios.post(`${gstinVerifyUrl}/business/Gstinverify`, {
      gstinNumber: payload.gst_in_number,
    });
    const isNameMatching = data.data.companyName.toLowerCase().trim() === payload.business_name.toLowerCase().trim();

    throwIfTrue(!isNameMatching, "Business name does not match GSTIN name");

    return data;
  } catch (error) {
    throwIfTrue(true, `External API error: ${error}`);
  }
};

export const addBusinessDetailsService = async (tenantId, user_id, businessData, files) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!user_id, "User ID is Required");
  throwIfTrue(!businessData.business_name, "Business Name is required");
  throwIfTrue(!businessData.gst_in_number, "GST Number is required");

  const { businessModelDB, userModelDB } = await getTenantModels(tenantId);

  const user = await userModelDB.findOne({ user_id });
  throwIfTrue(!user, "User not found");

  // Check if business with same GSTIN already exists
  let business = await businessModelDB.findOne({ gst_in_number: businessData.gst_in_number });

  let business_unique_id;
  let isUpdate = false;

  if (business) {
    business_unique_id = business.business_unique_id;
    isUpdate = true;
  } else {
    // Generate Business ID
    business_unique_id = generateBusinessId();
  }

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

  let updatedBusiness;

  if (isUpdate) {
    // Update existing business
    business.set({
      // ...businessData,
      user_id: user_id, // Ensure user_id is updated if needed (though usually same owner)
      images: imageUrls.length > 0 ? imageUrls : business.images, // Keep old images if no new ones, or replace? User "update it". Usually replace or append. Code logic suggests replacing if files provided.
      documents: documentUrls.length > 0 ? documentUrls : business.documents,
      is_active: true, // Reactivate
    });

    // If files were provided, we used the new arrays. existing code replaced them in the new object creation.
    // If files are NOT provided in update, we probably want to keep existing ones?
    // The previous code for new creation would set empty array if no files.
    // Here:
    if (imageUrls.length > 0) business.images = imageUrls;
    if (documentUrls.length > 0) business.documents = documentUrls;

    updatedBusiness = await business.save();
  } else {
    // Create Business Document (Pending Approval)
    updatedBusiness = new businessModelDB({
      ...businessData,
      user_id: user_id,
      business_unique_id,
      images: imageUrls,
      documents: documentUrls,
      is_active: true,
    });
    await updatedBusiness.save();
  }

  // Update User Model
  user.business_unique_id = business_unique_id;
  await user.save();

  // Notify All Admins in Background
  backgroundEmailProcess(tenantId, {
    ...businessData,
    user_id,
    business_unique_id,
  });

  const res = user.toObject();
  delete res.password;

  return {
    message: isUpdate
      ? "Business details updated and submitted for approval"
      : "Business registration submitted for approval",
    user: res,
  };
};

export const getAllBusinessDetailsService = async (
  tenantId,
  { assigned_to, page = 1, limit = 10, sort, search, is_active, is_verified }
) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  const { businessModelDB } = await getTenantModels(tenantId);

  const query = {};
  if (assigned_to) {
    query.assigned_to = assigned_to;
  }

  if (is_active === "true") {
    query.is_active = true;
  } else if (is_active === "false") {
    query.is_active = false;
  }

  if (is_verified === "true") {
    query.is_verified = true;
  } else if (is_verified === "false") {
    query.is_verified = false;
  }

  if (search) {
    const searchRegex = { $regex: search.trim(), $options: "i" };
    query.$or = [
      { business_name: searchRegex },
      { gst_in_number: searchRegex },
      { "business_address.city": searchRegex },
      { "business_address.state": searchRegex },
    ];
  }

  const sortOption = buildSortObject(sort);
  const skip = (page - 1) * limit;

  const [businesses, total] = await Promise.all([
    businessModelDB.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
    businessModelDB.countDocuments(query),
  ]);

  return {
    data: businesses,
    pagination: {
      totalCount: total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getByBusinessIdService = async (tenantId, business_unique_id) => {
  throwIfTrue(!tenantId, "Tenant ID is Required");
  throwIfTrue(!business_unique_id, "Business ID is Required");
  const { businessModelDB } = await getTenantModels(tenantId);
  const business = await businessModelDB.findOne({ business_unique_id });
  throwIfTrue(!business, "Business not found");
  return business;
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

export const assignBusinessDetailsService = async (tenantId, business_unique_id, updateData) => {
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

  // 📧 Send Verification Success Email & Update User Account Type
  if (updateData.is_verified === true) {
    const { userModelDB } = await getTenantModels(tenantId);
    const user = await userModelDB.findOne({ user_id: business.user_id });
    if (user) {
      user.account_type = "Business";
      // As per request to "add that is is verify is true"
      user.is_verified = true;
      await user.save();

      if (user.email) {
        await sendBusinessVerificationSuccessEmail(user.email, business.business_name);
      }
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
  const user = await userModelDB.findOneAndUpdate({ user_id }, { account_type: "Personal" }, { new: true });
  throwIfTrue(!user, "User not found");

  const res = user.toObject();
  delete res.password;

  return {
    message: "Business deactivated and account type changed to Personal",
    user: res,
  };
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
