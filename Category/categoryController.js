// import fs from "fs";
// import ExcelJS from "exceljs";
// import throwIfTrue from "../utils/throwIfTrue.js";
// import {
//   categoryBulkUploadService,
//   createCategoryService,
//   deleteCategoryService,
//   downloadCategoryExcelTemplateService,
//   getAllCategoriesService,
//   getCategoriesByIndustryIdService,
//   getCategoryByIdService,
//   updateCategoryService,
// } from "./categoryService.js";
// import { staticCategoryExcelHeaders } from "./staticExcelCategory.js";

// export const createCategoryController = async (req, res) => {
//   let uploadedFilePath = null;

//   try {
//     const {
//       industry_unique_id,
//       category_name,
//       // category_brand,
//       category_unique_id,
//       created_by,
//       // updated_by,
//       attributes,
//     } = req.body;

//     const tenantId = req.headers["x-tenant-id"];

//     uploadedFilePath = req.file ? req.file.path : null;

//     throwIfTrue(!uploadedFilePath, "Category image is required");

//     let parsedAttributes = [];
//     if (typeof attributes === "string") {
//       try {
//         parsedAttributes = JSON.parse(attributes);
//       } catch (err) {
//         console.warn("Invalid JSON format for attributes");
//       }
//     } else if (Array.isArray(attributes)) {
//       parsedAttributes = attributes;
//     }

//     const newCategory = await createCategoryService(
//       tenantId,
//       industry_unique_id,
//       category_unique_id,
//       category_name,
//       // category_brand,
//       uploadedFilePath,
//       created_by,
//       // updated_by,
//       parsedAttributes
//     );

//     res.status(201).json({
//       status: "success",
//       message: "Category created successfully",
//       data: newCategory,
//     });
//   } catch (error) {
//     console.error("Category creation failed in controller ===>", error.message);

//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       try {
//         fs.unlinkSync(uploadedFilePath);
//       } catch (unlinkErr) {
//         console.error("Error deleting unused image:", unlinkErr.message);
//       }
//     }

//     res.status(500).json({
//       status: "failed",
//       message: "Create category failed",
//       error: error.message,
//     });
//   }
// };

// export const getAllCategoriesController = async (req, res) => {
//   try {
//     const {
//       category_name,
//       category_brand,
//       category_unique_id,
//       is_active,
//       industry_unique_id,
//       search, // 🔥 global search bar
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const tenantId = req.headers["x-tenant-id"];

//     const filters = {
//       category_name,
//       category_brand,
//       category_unique_id,
//       is_active,
//       industry_unique_id,
//     };

//     const { categoryData, totalCount } = await getAllCategoriesService(tenantId, filters, search, page, limit);

//     res.status(200).json({
//       status: "Success",
//       message: "Category search success",
//       data: categoryData,
//       totalCount,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "Failed",
//       message: "Category search error",
//       error: error.message,
//     });
//   }
// };

// export const getCategoriesByIndustryIdController = async (req, res) => {
//   try {
//     const { id: industry_unique_id } = req.params;
//     const tenantId = req.headers["x-tenant-id"];

//     const categoryData = await getCategoriesByIndustryIdService(tenantId, industry_unique_id);

//     res.status(200).json({
//       status: "success",
//       message: "Category get by Industry ID data fetched successfully",
//       data: categoryData,
//     });
//   } catch (error) {
//     console.error("Get Categories By Industry ID Error", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: "Get Categories By Industry ID Error",
//       error: error.message,
//     });
//   }
// };

// export const getCategoryByIdController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const tenantId = req.headers["x-tenant-id"];

//     const categoryData = await getCategoryByIdService(tenantId, id);

//     res.status(200).json({
//       status: "success",
//       message: "Category get by ID data fetched successfully",
//       data: categoryData,
//     });
//   } catch (error) {
//     console.error("Category get data error", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: "Get category By ID error",
//       error: error.message,
//     });
//   }
// };

// export const updateCategoryController = async (req, res) => {
//   let uploadedFilePath = null;

//   try {
//     const tenantId = req.headers["x-tenant-id"];
//     const { id } = req.params; // category_unique_id
//     const {
//       category_name,
//       category_brand,
//       is_active,
//       attributes, // array of attributes from frontend (JSON)
//       updated_by,
//     } = req.body;

//     uploadedFilePath = req.file ? req.file.path : null;

//     const updates = {};
//     if (category_name) updates.category_name = category_name;
//     if (category_brand) updates.category_brand = category_brand;
//     if (is_active !== undefined) updates.is_active = is_active;
//     if (updated_by) updates.updated_by = updated_by;
//     if (uploadedFilePath) updates.category_image = uploadedFilePath;

//     if (attributes) {
//       try {
//         updates.attributes = typeof attributes === "string" ? JSON.parse(attributes) : attributes;
//       } catch (err) {
//         throw new Error("Invalid JSON format for attributes");
//       }
//     }

//     const { updatedRecord, oldImagePath } = await updateCategoryService(tenantId, id, updates);

//     if (uploadedFilePath && oldImagePath && fs.existsSync(oldImagePath)) {
//       try {
//         fs.unlinkSync(oldImagePath);
//       } catch (unlinkErr) {
//         console.error("⚠️ Error deleting old image:", unlinkErr.message);
//       }
//     }

//     res.status(200).json({
//       status: "Success",
//       message: "Category updated successfully",
//       data: updatedRecord,
//     });
//   } catch (error) {
//     console.error(" Update Category Controller error:", error.message);

//     if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
//       try {
//         fs.unlinkSync(uploadedFilePath);
//       } catch (unlinkErr) {
//         console.error("⚠️ Error deleting unused image:", unlinkErr.message);
//       }
//     }

//     res.status(500).json({
//       status: "Failed",
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// export const deleteCategoryController = async (req, res) => {
//   try {
//     const { id } = req.params; // category_unique_id
//     const tenantId = req.headers["x-tenant-id"];

//     const deletedData = await deleteCategoryService(tenantId, id);

//     //  Remove image file if it exists
//     if (deletedData?.category_image && fs.existsSync(deletedData.category_image)) {
//       try {
//         fs.unlinkSync(deletedData.category_image);
//       } catch (err) {
//         console.error("Error deleting category image:", err.message);
//       }
//     }

//     res.status(200).json({
//       status: "Success",
//       message: "Category deleted successfully",
//       data: deletedData,
//     });
//   } catch (error) {
//     console.error("Category delete failed in controller ===>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: "Category delete error",
//       error: error.message,
//     });
//   }
// };

// // controllers/downloadCategoryExcelTemplateController.js
// export const downloadCategoryExcelTemplateController = async (req, res) => {
//   try {
//     const tenantId = req.headers["x-tenant-id"];
//     if (!tenantId) {
//       return res.status(400).json({
//         status: "Failed",
//         message: "Tenant ID is required in header x-tenant-id",
//       });
//     }

//     const { id: industry_unique_id } = req.params;

//     const workbook = await downloadCategoryExcelTemplateService(tenantId, industry_unique_id);

//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", "attachment; filename=category_template.xlsx");

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Error in downloadCategoryExcelTemplateController ===>", error.message);
//     res.status(error.status || 500).json({
//       status: "Failed",
//       message: error.message || "Error downloading Category Excel template",
//     });
//   }
// };

// export const categoryBulkUploadController = async (req, res) => {
//   try {
//     const tenantId = req.headers["x-tenant-id"];
//     const { created_by } = req.body;
//     if (!tenantId) {
//       return res.status(400).json({
//         status: "Failed",
//         message: "Tenant ID is required in x-tenant-id",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         status: "Failed",
//         message: "Please upload an Excel (.xlsx) file",
//       });
//     }

//     // Call service
//     const result = await categoryBulkUploadService(tenantId, req.file.pa, staticCategoryExcelHeaders, created_by);

//     res.status(200).json({
//       status: "Success",
//       message: "Category bulk upload completed",
//       ...result,
//     });
//   } catch (error) {
//     console.error("Category Bulk Upload Error ===>", error);

//     res.status(500).json({
//       status: "Failed",
//       message: error.message || "Bulk upload failed",
//     });
//   }
// };
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
  updateCategoryService,
} from "./categoryService.js";

import { staticCategoryExcelHeaders } from "./staticExcelCategory.js";

// =======================
// Helper: Safe File Delete
// =======================
const safeDelete = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("File delete error:", err.message);
    }
  }
};

// =======================
// CREATE CATEGORY
// =======================
export const createCategoryController = async (req, res) => {
  let uploadedFilePath = req.file?.path || null;

  try {
    const tenantId = req.headers["x-tenant-id"];
    throwIfTrue(!uploadedFilePath, "Category image is required");

    const { industry_unique_id, category_name, category_unique_id, created_by, attributes } = req.body;

    const parsedAttributes = typeof attributes === "string" ? JSON.parse(attributes || "[]") : attributes || [];

    const newCategory = await createCategoryService(
      tenantId,
      industry_unique_id,
      category_unique_id,
      category_name,
      uploadedFilePath,
      created_by,
      parsedAttributes
    );

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Category creation error:", error.message);
    safeDelete(uploadedFilePath);

    res.status(500).json({
      status: "failed",
      message: "Create category failed",
      error: error.message,
    });
  }
};

// =======================
// GET ALL CATEGORIES
// =======================
export const getAllCategoriesController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { page = 1, limit = 10, search, ...filters } = req.query;

    const { categoryData, totalCount } = await getAllCategoriesService(tenantId, filters, search, page, limit);

    res.status(200).json({
      status: "Success",
      message: "Category search success",
      data: categoryData,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Category search error",
      error: error.message,
    });
  }
};

// =======================
// GET CATEGORIES BY INDUSTRY
// =======================
export const getCategoriesByIndustryIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const industry_unique_id = req.params.id;

    const categoryData = await getCategoriesByIndustryIdService(tenantId, industry_unique_id);

    res.status(200).json({
      status: "success",
      message: "Category get by Industry ID success",
      data: categoryData,
    });
  } catch (error) {
    console.error("Get by Industry ID Error:", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Get Categories By Industry ID Error",
      error: error.message,
    });
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

    res.status(200).json({
      status: "success",
      message: "Category fetched successfully",
      data: categoryData,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Get category By ID error",
      error: error.message,
    });
  }
};

// =======================
// UPDATE CATEGORY
// =======================
export const updateCategoryController = async (req, res) => {
  let uploadedFilePath = req.file?.path || null;

  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id } = req.params;

    const updates = {
      ...req.body,
      ...(uploadedFilePath && { category_image: uploadedFilePath }),
    };

    if (updates.attributes) {
      updates.attributes = typeof updates.attributes === "string" ? JSON.parse(updates.attributes) : updates.attributes;
    }

    const { updatedRecord, oldImagePath } = await updateCategoryService(tenantId, id, updates);

    safeDelete(oldImagePath);

    res.status(200).json({
      status: "Success",
      message: "Category updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    safeDelete(uploadedFilePath);

    res.status(500).json({
      status: "Failed",
      message: error.message || "Internal Server Error",
    });
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

    res.status(200).json({
      status: "Success",
      message: "Category deleted successfully",
      data: deletedData,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Category delete error",
      error: error.message,
    });
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
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
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
      return res.status(400).json({
        status: "Failed",
        message: "Please upload an Excel (.xlsx) file",
      });

    const result = await categoryBulkUploadService(tenantId, req.file.path, staticCategoryExcelHeaders, created_by);

    res.status(200).json({
      status: "Success",
      message: "Category bulk upload completed",
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message || "Bulk upload failed",
    });
  }
};
