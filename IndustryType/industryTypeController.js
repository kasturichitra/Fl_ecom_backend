import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  createIndustryTypeServices,
  deleteIndustryTypeServices,
  getIndustrysSearchServices,
  updateIndustrytypeServices,
} from "./industryTypeService.js";


// ===============================
// CREATE INDUSTRY
// ===============================

export const createIndustryTypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) return res.status(400).json({ status: "Failed", message: "Tenant ID is required" });

    const payload = {
      ...req.body,
      industry_name: req.body.industry_name?.trim(),
      image_url: req.file?.path ?? null,
    };

    const data = await createIndustryTypeServices(tenantID, payload);
    res.status(201).json(successResponse("Industry Type created successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
// ===============================
// SEARCH INDUSTRY
// ===============================

export const getIndustrysSearchController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) return res.status(400).json({ status: "Failed", message: "Tenant ID is required" });

    const result = await getIndustrysSearchServices(
      tenantID,
      req.query.search,
      req.query.industry_name,
      req.query.industry_unique_id,
      req.query.is_active,
      req.query.created_by,
      req.query.startDate,
      req.query.endDate,
      +req.query.page || 1,
      +req.query.limit || 10,
       req.query.sort
    );

    res.status(200).json(
      successResponse("Industry search data fetched successfully", {
        data: result.industryData,
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
// ===============================
// UPDATE INDUSTRY
// ===============================


export const updateIndustryTypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) return res.status(400).json({ status: "Failed", message: "Tenant ID is required" });

    const { id } = req.params;
    const { industry_name, description, is_active, created_by, updated_by } = req.body;
    const image_url = req.file?.path;

    const updates = {
      ...(industry_name && { industry_name: industry_name.trim() }),
      ...(description && { description: description.trim() }),
      ...(created_by && { created_by }),
      ...(updated_by && { updated_by }),
      ...(image_url && { image_url }),
      ...(is_active !== undefined && { is_active: is_active === "true" || is_active === true }),
    };

    const data = await updateIndustrytypeServices(tenantID, id, updates);

    res.status(200).json(successResponse("Industry Type updated successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

// ===============================
// DELETE INDUSTRY
// ===============================
export const deleteIndustrytypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) return res.status(400).json({ status: "Failed", message: "Tenant ID is required" });

    const data = await deleteIndustryTypeServices(tenantID, req.params.id);
    res.status(200).json(successResponse("Industry Type deleted successfully", { data }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};


// import throwIfTrue from "../utils/throwIfTrue.js";
// import {
//   createIndustryTypeServices,
//   deleteIndustryTypeServices,
//   getIndustrysSearchServices,
//   updateIndustrytypeServices,
// } from "./industryTypeService.js";

// export const createIndustryTypeController = async (req, res) => {
//   try {
//     const tenantID = req.headers["x-tenant-id"];
//     const { industry_unique_id, industry_name, description, is_active, created_by, updated_by } = req.body;

//     throwIfTrue(!industry_name, "Industry Name is required");

//     const image_url = req.file ? req.file.path : null;

//     const response = await createIndustryTypeServices(tenantID, {
//       industry_unique_id,
//       industry_name,
//       description,
//       is_active,
//       created_by,
//       updated_by,
//       image_url,
//     });

//     res.status(201).json({
//       status: "Success",
//       message: "Industry Type created successfully",
//       data: response,
//     });
//   } catch (error) {
//     console.error("createIndustryTypeController error ===>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// export const getIndustrysSearchController = async (req, res) => {
//   try {
//     const {
//       search,
//       industry_name,
//       industry_unique_id,
//       is_active,
//       created_by,
//       startDate,
//       endDate,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const tenantID = req.headers["x-tenant-id"];

//     const result = await getIndustrysSearchServices(
//       tenantID,
//       search,
//       industry_name,
//       industry_unique_id,
//       is_active,
//       created_by,
//       startDate,
//       endDate,
//       Number(page),
//       Number(limit)
//     );

//     res.status(200).json({
//       status: "Success",
//       message: "Industry search data fetched successfully",
//       data: result.industryData,
//       totalCount: result.totalCount,
//       currentPage: result.currentPage,
//       totalPages: result.totalPages,
//     });
//   } catch (error) {
//     console.log("Industry Search Error ====>", error.message);

//     res.status(500).json({
//       status: "Failed",
//       message: "Industry search failed",
//       error: error.message,
//     });
//   }
// };


// export const updateIndustryTypeController = async (req, res) => {
//   try {
//     const tenantID = req.headers["x-tenant-id"];
//     const { id } = req.params;

//     const { industry_name, description, is_active, created_by, updated_by } = req.body;

//     const image_url = req.file ? req.file.path : undefined;

//     const updates = {};
//     if (industry_name) updates.industry_name = industry_name;
//     if (description) updates.description = description;
//     if (is_active !== undefined) updates.is_active = is_active === "true" || is_active === true;
//     if (created_by) updates.created_by = created_by;
//     if (updated_by) updates.updated_by = updated_by;
//     if (image_url) updates.image_url = image_url;

//     const response = await updateIndustrytypeServices(tenantID, id, updates);

//     res.status(200).json({
//       status: "Success",
//       message: "Industry Type updated successfully",
//       data: response,
//     });
//   } catch (error) {
//     console.error("updateIndustryTypeController error ===>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// export const deleteIndustrytypeController = async (req, res) => {
//   try {
//     const tenateID = req.headers["x-tenant-id"];
//     const { id } = req.params;

//     const response = await deleteIndustryTypeServices(tenateID, id);
//     res.status(200).json({
//       status: "Success",
//       message: "Industry Type deleted successfully",
//       data: response,
//     });
//   } catch (error) {
//     console.error("delete IndustryTypeController  error ===>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// ==========================

// // Helper: safe file delete
// const safeDelete = (filePath) => {
//   try {
//     if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
//   } catch (err) {
//     console.error("File delete error:", err.message);
//   }
// };
