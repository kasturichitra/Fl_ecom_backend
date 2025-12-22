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
    const searchOr = [{ coupon_code: searchRegex }, { coupon_type: searchRegex }, { apply_on: searchRegex }];

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
    Coupon.find(query).sort(sortObject).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(query),
  ]);

  return { coupons, totalCount };
};

export const updateCouponService = async (tenantId, id, updateData) => {
  throwIfTrue(!tenantId, "Tenant ID is required");
  const Coupon = await CouponModel(tenantId);

  if (updateData.coupon_code) {
    updateData.coupon_code = updateData.coupon_code.toUpperCase();
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  throwIfTrue(!updatedCoupon, "Coupon not found");

  return updatedCoupon;
};
