
import throwIfTrue from "../utils/throwIfTrue.js";
import {
  createIndustryTypeServices,
  deleteIndustryTypeServices,
  getIndustrysSearchServices,
  updateIndustrytypeServices,
} from "./industryTypeService.js";

// Helper: safe file delete
const safeDelete = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("File delete error:", err.message);
  }
};

// ===============================
// CREATE INDUSTRY
// ===============================
export const createIndustryTypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const {
      industry_unique_id,
      industry_name,
      description,
      is_active,
      created_by,
      updated_by,
    } = req.body;

    throwIfTrue(!industry_name, "Industry Name is required");

    const image_url = req.file?.path || null;

    const response = await createIndustryTypeServices(tenantID, {
      industry_unique_id,
      industry_name,
      description,
      is_active,
      created_by,
      updated_by,
      image_url,
    });

    res.status(201).json({
      status: "Success",
      message: "Industry Type created successfully",
      data: response,
    });
  } catch (error) {
    console.error("createIndustryTypeController error ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// ===============================
// SEARCH INDUSTRY
// ===============================
export const getIndustrysSearchController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const {
      search,
      industry_name,
      industry_unique_id,
      is_active,
      created_by,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const result = await getIndustrysSearchServices(
      tenantID,
      search,
      industry_name,
      industry_unique_id,
      is_active,
      created_by,
      startDate,
      endDate,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      status: "Success",
      message: "Industry search data fetched successfully",
      data: result.industryData,
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.log("Industry Search Error ====>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Industry search failed",
      error: error.message,
    });
  }
};

// ===============================
// UPDATE INDUSTRY
// ===============================
export const updateIndustryTypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params;

    const {
      industry_name,
      description,
      is_active,
      created_by,
      updated_by,
    } = req.body;

    const image_url = req.file?.path;

    const updates = {
      ...(industry_name && { industry_name }),
      ...(description && { description }),
      ...(created_by && { created_by }),
      ...(updated_by && { updated_by }),
      ...(image_url && { image_url }),
    };

    if (is_active !== undefined) {
      updates.is_active = is_active === "true" || is_active === true;
    }

    const response = await updateIndustrytypeServices(tenantID, id, updates);

    res.status(200).json({
      status: "Success",
      message: "Industry Type updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("updateIndustryTypeController error ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
  }
};

// ===============================
// DELETE INDUSTRY
// ===============================
export const deleteIndustrytypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params;

    const response = await deleteIndustryTypeServices(tenantID, id);

    res.status(200).json({
      status: "Success",
      message: "Industry Type deleted successfully",
      data: response,
    });
  } catch (error) {
    console.error("delete IndustryTypeController error ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: error.message,
    });
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