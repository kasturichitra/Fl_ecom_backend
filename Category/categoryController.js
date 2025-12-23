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

// Create Category
export const createCategoryController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { image_base64, ...data } = req.body;

    let fileBuffer = null;

    if (image_base64) {
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");
      fileBuffer = Buffer.from(base64Data, "base64");
    }

    const response = await createCategoryService(tenantId, data, fileBuffer);

    res.status(201).json(successResponse("Category created successfully", { data: response }));
  } catch (error) {
    res.status(error.status || 500).json(errorResponse(error.message, error));
  }
};

// Get All Categories
export const getAllCategoriesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { page = 1, limit = 10, search, sort, ...filters } = req.query;

    const { categoryData, totalCount } = await getAllCategoriesService(
      tenantId,
      filters,
      search?.trim(),
      +page,
      +limit,
      sort
    );

    res.json(successResponse("Category search success", { data: categoryData, totalCount }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Get Categories by Industry ID
export const getCategoriesByIndustryIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const data = await getCategoriesByIndustryIdService(tenantId, req.params.id);

    res.json(successResponse("Category get by Industry ID success", { data }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Get Category by ID
export const getCategoryByIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;

    const categoryData = await getCategoryByIdService(tenantId, id);

    res.status(200).json(successResponse("Category fetched successfully", { data: categoryData }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Get Grouped Industries and Categories
export const getGroupedIndustriesAndCategoriesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const filters = req.query;

    const data = await getGroupedIndustriesAndCategoriesService(tenantId, filters);

    res.status(200).json(successResponse("Industries and Categories fetched successfully", data));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Update Category
export const updateCategoryController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;
    const { image_base64, ...data } = req.body;

    let fileBuffer = null;

    if (image_base64) {
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");
      fileBuffer = Buffer.from(base64Data, "base64");
    }

    const response = await updateCategoryService(tenantId, id, data, fileBuffer);

    res.json(successResponse("Category updated successfully", { data: response }));
  } catch (error) {
    res.status(error.status || 500).json(errorResponse(error.message, error));
  }
};

// Delete Category
export const deleteCategoryController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;

    const deletedData = await deleteCategoryService(tenantId, id);

    res.status(200).json(successResponse("Category deleted successfully", { data: deletedData }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Download Excel Template
export const downloadCategoryExcelTemplateController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const industry_unique_id = req.params.id;

    const workbook = await downloadCategoryExcelTemplateService(tenantId, industry_unique_id);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=category_template.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// Bulk Upload Category
export const categoryBulkUploadController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { created_by } = req.body;

    if (!req.file) {
      return res.status(400).json(errorResponse("Please upload an Excel (.xlsx) file"));
    }

    const result = await categoryBulkUploadService(tenantId, req.file.path, staticCategoryExcelHeaders, created_by);

    res.status(200).json(successResponse("Category bulk upload completed", { ...result }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message || "Bulk upload failed", error));
  }
};
