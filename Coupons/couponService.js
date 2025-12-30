import { customAlphabet } from "nanoid";
import throwIfTrue from "../utils/throwIfTrue.js";
import { getTenantModels } from "../lib/tenantModelsCache.js";
import { couponAlphabet } from "../env.js";
import { buildSortObject } from "../utils/buildSortObject.js";
import { sendCouponEmail } from "../utils/sendEmail.js";
import UserModel from "../Users/userModel.js";

const generateNanoId = customAlphabet(couponAlphabet, 8);

export const createCouponService = async (tenantId, couponData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  throwIfTrue(!couponData.coupon_code, "Coupon code is required");
  throwIfTrue(!couponData.coupon_type, "Coupon type is required");
  throwIfTrue(!couponData.apply_on, "Apply on field is required");
  throwIfTrue(!couponData.coupon_start_date, "Coupon start date is required");
  throwIfTrue(!couponData.coupon_end_date, "Coupon end date is required");

  if (couponData.coupon_code) {
    couponData.coupon_code = couponData.coupon_code.toUpperCase();
  }

  // Validation and sanitation for User Specificity
  if (couponData.coupon_type === "User_Specific") {
    throwIfTrue(!couponData.user || couponData.user.length === 0, "Users are required for User_Specific coupons");
  } else if (couponData.coupon_type === "Generic") {
    couponData.user = [];
  }

  // Clear irrelevant selection fields based on apply_on
  if (couponData.apply_on === "Product") {
    couponData.selected_categories = [];
    couponData.selected_brands = [];
  } else if (couponData.apply_on === "Category") {
    couponData.selected_products = [];
    couponData.selected_brands = [];
  } else if (couponData.apply_on === "Brand") {
    couponData.selected_products = [];
    couponData.selected_categories = [];
  } else if (couponData.apply_on === "Order") {
    couponData.selected_products = [];
    couponData.selected_categories = [];
    couponData.selected_brands = [];
  }

  const { couponModelDB } = await getTenantModels(tenantId);
  const coupon = await couponModelDB.create(couponData);

  // Send emails if User_Specific
  // Send emails if User_Specific (Background Process)
  if (coupon.coupon_type === "User_Specific" && coupon.user && coupon.user.length > 0) {
    processBackgroundEmails(tenantId, coupon).catch((err) => console.error("Background email error:", err));
  }

  return coupon;
};

export const generateUniqueCouponCodeService = async (tenantId) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const { couponModelDB } = await getTenantModels(tenantId);
  let isUnique = false;
  let newCode;

  while (!isUnique) {
    newCode = generateNanoId();
    const existing = await couponModelDB.findOne({ coupon_code: newCode });
    if (!existing) {
      isUnique = true;
    }
  }

  throwIfTrue(!isUnique, "Failed to generate a unique coupon code after multiple attempts");

  return newCode;
};

export const getAllCouponsService = async (tenantId, filters, search, page, limit, sort, status) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const { couponModelDB } = await getTenantModels(tenantId);
  const { product_id, category_id, brand_id, ...cleanedFilters } = filters;
  let query = { ...cleanedFilters };

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    const searchNumber = Number(search);
    const searchOr = [
      { coupon_code: searchRegex },
      { coupon_type: searchRegex },
      { apply_on: searchRegex },
      { "user.label": searchRegex },
      { "user.value": searchRegex },
    ];

    if (!isNaN(searchNumber)) {
      searchOr.push(
        { discount_percentage: searchNumber },
        { discount_amount: searchNumber },
        { min_order_amount: searchNumber },
        { total_useage_limit: searchNumber }
      );
    }
    query.$or = searchOr;
  }

  // Advanced filtering: Contextual applicability
  // If identifying info is provided, we want coupons that match THAT specific context OR are global ('Order')
  if (product_id || category_id || brand_id) {
    const contextConditions = [
      { apply_on: "Order" }, // Global coupons are always applicable
    ];

    if (product_id) {
      contextConditions.push({ apply_on: "Product", "selected_products.value": product_id });
    }
    if (category_id) {
      contextConditions.push({ apply_on: "Category", "selected_categories.value": category_id });
    }
    if (brand_id) {
      contextConditions.push({ apply_on: "Brand", "selected_brands.value": brand_id });
    }

    if (query.$or) {
      // If search exists, we need BOTH (search matches AND context matches)
      query.$and = [{ $or: query.$or }, { $or: contextConditions }];
      delete query.$or;
    } else {
      query.$or = contextConditions;
    }
  }

  const skip = (page - 1) * limit;
  const sortObject = buildSortObject(sort);

  if (status) {
    query.status = status;
  }
  const result = await couponModelDB.aggregate([
    { $match: query },

    {
      $facet: {
        data: [{ $sort: sortObject }, { $skip: skip }, { $limit: Number(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const coupons = result[0].data;
  const totalCount = result[0].totalCount[0]?.count || 0;

  return { coupons, totalCount };
};

export const getByIdCouponService = async (tenantId, id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const { couponModelDB } = await getTenantModels(tenantId);
  const coupon = await couponModelDB.findById(id).lean();
  throwIfTrue(!coupon, "Coupon not found");
  return coupon;
};

export const updateCouponService = async (tenantId, id, updateData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const { couponModelDB } = await getTenantModels(tenantId);
  const existingCoupon = await couponModelDB.findById(id);
  throwIfTrue(!existingCoupon, "Coupon not found");

  if (updateData.coupon_code) {
    updateData.coupon_code = updateData.coupon_code.toUpperCase();
  }

  const finalType = updateData.coupon_type || existingCoupon.coupon_type;
  const finalApplyOn = updateData.apply_on || existingCoupon.apply_on;

  // Handle User Specificity sanitation and validation
  if (finalType === "Generic") {
    updateData.user = [];
  } else if (finalType === "User_Specific") {
    let users = updateData.user || existingCoupon.user;
    throwIfTrue(!users || users.length === 0, "Users are required for User_Specific coupons");

    // Merge existing email_sent status
    if (updateData.user) {
      updateData.user = updateData.user.map((newUser) => {
        const existingUser = existingCoupon.user.find((u) => u.value === newUser.value);
        // If user existed and email was sent, keep it true. Otherwise defaults to false (from model) or undefined.
        // We Explicitly set it to preserve history or prepare for new send.
        return {
          ...newUser,
          email_sent: false,
        };
      });
      users = updateData.user;
    }
  }

  // Clear irrelevant selection fields based on final apply_on
  if (finalApplyOn === "Product") {
    updateData.selected_categories = [];
    updateData.selected_brands = [];
  } else if (finalApplyOn === "Category") {
    updateData.selected_products = [];
    updateData.selected_brands = [];
  } else if (finalApplyOn === "Brand") {
    updateData.selected_products = [];
    updateData.selected_categories = [];
  } else if (finalApplyOn === "Order") {
    updateData.selected_products = [];
    updateData.selected_categories = [];
    updateData.selected_brands = [];
  }

  let updatedCoupon = await couponModelDB.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  throwIfTrue(!updatedCoupon, "Coupon not found");

  // Send emails for Update if User_Specific (Background Process)
  // We check who hasn't received an email yet (email_sent: false)
  if (updatedCoupon.coupon_type === "User_Specific" && updatedCoupon.user && updatedCoupon.user.length > 0) {
    processBackgroundEmails(tenantId, updatedCoupon).catch((err) =>
      console.error("Background update email error:", err)
    );
  }

  return updatedCoupon;
};

export const deleteCouponService = async (tenantId, id) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const { couponModelDB } = await getTenantModels(tenantId);
  const deletedCoupon = await couponModelDB.findByIdAndDelete(id).lean();
  throwIfTrue(!deletedCoupon, "Coupon not found");
  return deletedCoupon;
};

// Reusable helper function for background email processing
const processBackgroundEmails = async (tenantId, coupon) => {
  try {
    const usersPendingEmail = coupon.user.filter((u) => !u.email_sent);

    if (usersPendingEmail.length > 0) {
      const { couponModelDB, userModelDB } = await getTenantModels(tenantId);
      const userIds = usersPendingEmail.map((u) => u.value);
      const usersData = await userModelDB.find({ _id: { $in: userIds } }).select("email");

      const emailPromises = usersData.map(async (user) => {
        if (user.email) {
          await sendCouponEmail(user.email, coupon);
          // Update the specific user in the users array
          // We need to mutate the mongoose document or prepare an update operation
          await couponModelDB.updateOne(
            { _id: coupon._id, "user.value": user._id.toString() },
            { $set: { "user.$.email_sent": true } }
          );
        }
      });

      await Promise.all(emailPromises);
    }
  } catch (error) {
    console.error("Failed to send coupon emails (background):", error);
  }
};
