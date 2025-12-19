import { createCouponService, generateUniqueCouponCodeService, getAllCouponsService, updateCouponService } from "./couponService.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

export const createCouponController = async (req, res) => {
    try {
        const tenantId = req.headers["x-tenant-id"];

        const data = await createCouponService(tenantId, req.body);

        res.status(201).json(successResponse("Coupon created successfully", { data }));
    } catch (error) {
        res.status(error.message.includes("exists") ? 400 : 500).json(errorResponse(error.message, error));
    }
};

export const generateUniqueCouponCodeController = async (req, res) => {
    try {
        const tenantId = req.headers["x-tenant-id"];

        const code = await generateUniqueCouponCodeService(tenantId);

        res.status(200).json(successResponse("Coupon code generated successfully", { code }));
    } catch (error) {
        res.status(500).json(errorResponse(error.message, error));
    }
};

export const getAllCouponsController = async (req, res) => {
    try {
        const tenantId = req.headers["x-tenant-id"];
        const { page = 1, limit = 10, search, sort, status, ...filters } = req.query;

        const { coupons, totalCount } = await getAllCouponsService(
            tenantId,
            filters,
            search?.trim(),
            +page,
            +limit,
            sort,
            status
        );

        res.json(successResponse("Coupons fetched successfully", { coupons, totalCount }));
    } catch (error) {
        res.status(500).json(errorResponse(error.message, error));
    }
};

export const updateCouponController = async (req, res) => {
    try {
        const tenantId = req.headers["x-tenant-id"];
        const { id } = req.params;

        const updatedCoupon = await updateCouponService(tenantId, id, req.body);

        res.status(200).json(successResponse("Coupon updated successfully", { data: updatedCoupon }));
    } catch (error) {
        res.status(error.message.includes("not found") ? 404 : 500).json(errorResponse(error.message, error));
    }
};
