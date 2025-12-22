import { customAlphabet } from "nanoid";
import throwIfTrue from "../utils/throwIfTrue.js";
import CouponModel from "./couponModel.js";
import { couponAlphabet } from "../env.js";
import { buildSortObject } from "../utils/buildSortObject.js";

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
        throwIfTrue(!couponData.users || couponData.users.length === 0, "Users are required for User_Specific coupons");
    } else if (couponData.coupon_type === "Generic") {
        couponData.users = [];
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

    const Coupon = await CouponModel(tenantId);
    const coupon = await Coupon.create(couponData);
    return coupon;
};

export const generateUniqueCouponCodeService = async (tenantId) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    const Coupon = await CouponModel(tenantId);
    let isUnique = false;
    let newCode;

    while (!isUnique) {
        newCode = generateNanoId();
        const existing = await Coupon.findOne({ coupon_code: newCode });
        if (!existing) {
            isUnique = true;
        }
    }

    throwIfTrue(!isUnique, "Failed to generate a unique coupon code after multiple attempts");

    return newCode;
};

export const getAllCouponsService = async (tenantId, filters, search, page, limit, sort, status) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    const Coupon = await CouponModel(tenantId);
    let query = { ...filters };

    if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        const searchNumber = Number(search);
        const searchOr = [
            { coupon_code: searchRegex },
            { coupon_type: searchRegex },
            { apply_on: searchRegex },
            { "user_id.label": searchRegex },
            { "user_id.value": searchRegex },
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

    const skip = (page - 1) * limit;
    const sortObject = buildSortObject(sort);

    if (status) {
        query.status = status;
    }

    const [coupons, totalCount] = await Promise.all([
        Coupon.find(query)
            .sort(sortObject)
            .skip(skip)
            .limit(limit)
            .lean(),
        Coupon.countDocuments(query),
    ]);

    return { coupons, totalCount };
};

export const getByIdCouponService = async (tenantId, id) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    const Coupon = await CouponModel(tenantId);
    const coupon = await Coupon.findById(id).lean();
    throwIfTrue(!coupon, "Coupon not found");
    return coupon;
};

export const updateCouponService = async (tenantId, id, updateData) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    const Coupon = await CouponModel(tenantId);
    const existingCoupon = await Coupon.findById(id);
    throwIfTrue(!existingCoupon, "Coupon not found");

    if (updateData.coupon_code) {
        updateData.coupon_code = updateData.coupon_code.toUpperCase();
    }

    const finalType = updateData.coupon_type || existingCoupon.coupon_type;
    const finalApplyOn = updateData.apply_on || existingCoupon.apply_on;

    // Handle User Specificity sanitation and validation
    if (finalType === "Generic") {
        updateData.users = [];
    } else if (finalType === "User_Specific") {
        const users = updateData.users || existingCoupon.users;
        throwIfTrue(!users || users.length === 0, "Users are required for User_Specific coupons");
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

    const updatedCoupon = await Coupon.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).lean();

    throwIfTrue(!updatedCoupon, "Coupon not found");

    return updatedCoupon;
};


export const deleteCouponService = async (tenantId, id) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    const Coupon = await CouponModel(tenantId);
    const deletedCoupon = await Coupon.findByIdAndDelete(id).lean();
    throwIfTrue(!deletedCoupon, "Coupon not found");
    return deletedCoupon;
};