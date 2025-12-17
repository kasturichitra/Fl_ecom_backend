import fs from "fs";
import throwIfTrue from "../utils/throwIfTrue.js";
import {
  categoryBulkUploadService,
  createCategoryService,
  deleteCategoryService,
  downloadCategoryExcelTemplateService,
  getAllCategoriesService,
  getCategoriesByIndustryIdService,
  getCategoryByIdService,
  getGroupedIndustriesAndCategoriesService,
  updateCategoryService,
} from "./categoryService.js";

import { staticCategoryExcelHeaders } from "./staticExcelCategory.js";
import { errorResponse, successResponse } from "../utils/responseHandler.js";

// =======================
// Helper: Safe File Delete
// =======================
const safeDelete = (path) => path && fs.existsSync(path) && fs.unlink(path, () => {});

// =======================
// CREATE CATEGORY
// =======================
export const createCategoryController = async (req, res) => {
  const filePath = req.file?.path;
  try {
    throwIfTrue(!filePath, "Category image is required");

    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is required");

    const { industry_unique_id, category_name, category_unique_id, created_by, attributes } = req.body;
    const attrs = typeof attributes === "string" ? JSON.parse(attributes || "[]") : attributes || [];

    const data = await createCategoryService(
      tenantId,
      industry_unique_id,
      category_unique_id,
      category_name,
      filePath,
      created_by,
      attrs
    );

    // res.status(201).json({
    //   status: "success",
    //   message: "Category created successfully",
    //   data,
    // });

    res.status(201).json(successResponse("Category created successfully", { data }));
  } catch (error) {
    safeDelete(filePath);
    // res
    //   .status(error.message.includes("required") || error.message.includes("exists") ? 400 : 500)
    //   .json({ status: "failed", message: error.message });

    res
      .status(error.message.includes("required") || error.message.includes("exists") ? 400 : 500)
      .json(errorResponse(error.message, error));
  }
};

// =======================
// GET ALL CATEGORIES
// =======================
export const getAllCategoriesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is required");

    const { page = 1, limit = 10, search, sort, ...filters } = req.query;

    const { categoryData, totalCount } = await getAllCategoriesService(
      tenantId,
      filters,
      search?.trim(),
      +page,
      +limit,
      sort
    );

    // res.json({
    //   status: "Success",
    //   message: "Category search success",
    //   data: categoryData,
    //   totalCount,
    // });

    res.json(successResponse("Category search success", { data: categoryData, totalCount }));
  } catch (error) {
    // res.status(500).json({
    //   status: "Failed",
    //   message: error.message,
    // });

    res.status(500).json(errorResponse(error.message, error));
  }
};

// =======================
// GET CATEGORIES BY INDUSTRY
// =======================
export const getCategoriesByIndustryIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is required");

    const data = await getCategoriesByIndustryIdService(tenantId, req.params.id);

    // res.json({ status: "success", message: "Category get by Industry ID success", data });

    res.json(successResponse("Category get by Industry ID success", { data }));
  } catch (error) {
    // res.status(500).json({ status: "Failed", message: error.message });
    res.status(500).json(errorResponse(error.message, error));
  }
};

// =======================
// GET CATEGORY BY ID
// =======================
export const getCategoryByIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;

    const categoryData = await getCategoryByIdService(tenantId, id);

    // res.status(200).json({
    //   status: "success",
    //   message: "Category fetched successfully",
    //   data: categoryData,
    // });
    res.status(200).json(successResponse("Category fetched successfully", { data: categoryData }));
  } catch (error) {
    // res.status(500).json({
    //   status: "Failed",
    //   message: "Get category By ID error",
    //   error: error.message,
    // });
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getGroupedIndustriesAndCategoriesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is Required");

    const filters = req.query;

    const data = await getGroupedIndustriesAndCategoriesService(tenantId, filters);

    res.status(200).json(successResponse("Industries and Categories fetched successfully", data));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// =======================
// UPDATE CATEGORY
// =======================
export const updateCategoryController = async (req, res) => {
  const newImagePath = req.file?.path;
  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!tenantId, "Tenant ID is required");

    const updates = { ...req.body };
    if (newImagePath) updates.category_image = newImagePath;

    const { updatedRecord, oldImagePath } = await updateCategoryService(tenantId, req.params.id, updates);

    if (newImagePath && oldImagePath) safeDelete(oldImagePath);

    // res.json({
    //   status: "Success",
    //   message: "Category updated successfully",
    //   data: updatedRecord,
    // });

    res.json(successResponse("Category updated successfully", { data: updatedRecord }));
  } catch (error) {
    if (newImagePath) safeDelete(newImagePath);
    // res.status(500).json({ status: "Failed", message: error.message });
    res.status(500).json(errorResponse(error.message, error));
  }
};

// =======================
// DELETE CATEGORY
// =======================
export const deleteCategoryController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;

    const deletedData = await deleteCategoryService(tenantId, id);

    safeDelete(deletedData?.category_image);

    // res.status(200).json({
    //   status: "Success",
    //   message: "Category deleted successfully",
    //   data: deletedData,
    // });

    res.status(200).json(successResponse("Category deleted successfully", { data: deletedData }));
  } catch (error) {
    // res.status(500).json({
    //   status: "Failed",
    //   message: "Category delete error",
    //   error: error.message,
    // });

    res.status(500).json(errorResponse(error.message, error));
  }
};

// =======================
// DOWNLOAD EXCEL TEMPLATE
// =======================
export const downloadCategoryExcelTemplateController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    if (!tenantId)
      return res.status(400).json({
        status: "Failed",
        message: "Tenant ID is required in header x-tenant-id",
      });

    const industry_unique_id = req.params.id;

    const workbook = await downloadCategoryExcelTemplateService(tenantId, industry_unique_id);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=category_template.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    // res.status(500).json({
    //   status: "Failed",
    //   message: error.message,
    // });

    res.status(500).json(errorResponse(error.message, error));
  }
};

// =======================
// BULK UPLOAD CATEGORY
// =======================
export const categoryBulkUploadController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { created_by } = req.body;

    if (!tenantId)
      return res.status(400).json({
        status: "Failed",
        message: "Tenant ID is required in x-tenant-id",
      });

    if (!req.file)
      // return res.status(400).json({
      //   status: "Failed",
      //   message: "Please upload an Excel (.xlsx) file",
      // });
      return res.status(400).json(errorResponse("Please upload an Excel (.xlsx) file"));

    const result = await categoryBulkUploadService(tenantId, req.file.path, staticCategoryExcelHeaders, created_by);

    // res.status(200).json({
    //   status: "Success",
    //   message: "Category bulk upload completed",
    //   ...result,
    // });
    res.status(200).json(successResponse("Category bulk upload completed", { ...result }));
  } catch (error) {
    // res.status(500).json({
    //   status: "Failed",
    //   message: error.message || "Bulk upload failed",
    // });
    res.status(500).json(errorResponse(error.message || "Bulk upload failed", error));
  }
};
