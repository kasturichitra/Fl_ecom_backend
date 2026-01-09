import { gstinVerifyUrl } from "../env.js";
import axios from "axios";
import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { uploadImageVariants } from "../lib/aws-s3/uploadImageVariants.js";
import { uploadDocuments } from "../lib/aws-s3/uploadDocuments.js";
import generateBusinessId from "./utils/generateBusinessId.js";
import { sendBusinessApprovalEmailToAdmin } from "../utils/sendEmail.js";
import fs from "fs";


export const gstinVerifyService = async (payload) => {
    throwIfTrue(!payload.gstinNumber, "Gstin Number Required");
    throwIfTrue(!payload.business_name, "Business Name Required");

    const { data } = await axios.post(`${gstinVerifyUrl}/business/Gstinverify`, { gstinNumber: payload.gstinNumber });
    if (data.data.companyName.toLowerCase().trim() === payload.business_name.toLowerCase().trim()) {
        return data;
    } else {
        throwIfTrue(true, "Business Name Not Matched")
    }

}


export const addBusinessDetailsService = async (tenantId, user_id, businessData, files) => {
   
    throwIfTrue(!tenantId, "Tenant ID is Required");
    throwIfTrue(!user_id, "User ID is Required");
    throwIfTrue(!businessData.business_name, "Business Name is required");
    throwIfTrue(!businessData.gstinNumber, "GST Number is required");

    const { businessModelDB, userModelDB } = await getTenantModels(tenantId);

    const user = await userModelDB.findById(user_id);
    throwIfTrue(!user, "User not found");

    // Check if business with same GSTIN already exists
    const existingBusiness = await businessModelDB.findOne({ gstinNumber: businessData.gstinNumber });

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
                    basePath: `businesses/${business_unique_id}/images`
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
                    originalName: file.originalname
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
        is_active: true
    });

    await newBusiness.save();

    // Update User Model
    user.business_unique_id = business_unique_id;
    const updatedUser = await user.save();

    // Notify All Admins in Background
    backgroundEmailProcess(tenantId, {
        ...businessData,
        user_id,
        business_unique_id
    });

    const res = updatedUser.toObject();
    delete res.password;

    return { message: "Business registration submitted for approval", user: res };
};


const backgroundEmailProcess = async (tenantId, businessData) => {
    try {
        const { userModelDB } = await getTenantModels(tenantId);

        // Fetch all active admins
        const admins = await userModelDB.find({ role: "admin", is_active: true }, "email");

        if (admins.length > 0) {
            await Promise.all(
                admins.map(admin =>
                    sendBusinessApprovalEmailToAdmin(admin.email, businessData)
                )
            );
            console.log(`Business approval emails sent to ${admins.length} admins.`);
        } else {
            console.log("No active admins found to notify for business approval.");
        }
    } catch (error) {
        console.error("Error in backgroundEmailProcess:", error.message);
    }
};
