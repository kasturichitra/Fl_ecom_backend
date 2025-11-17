import throwIfTrue from "../utils/throwIfTrue.js";
import { createIndustryTypeServices, deleteIndustryTypeServices, getIndustrySearchServices, getIndustryTypeServices, updateIndustrytypeServices } from "./industryTypeService.js";

export const createIndustryTypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const {
      industry_unique_ID,
      industry_name,
      description,
      is_active,
      created_by,
      updated_by,
    } = req.body;

    throwIfTrue(!industry_name, "Industry Name is required");

    const image_url = req.file ? req.file.path : null;

    const response = await createIndustryTypeServices(
      tenantID,
      {
        industry_unique_ID,
        industry_name,
        description,
        is_active,
        created_by,
        updated_by,
        image_url,
      }
    );

    res.status(201).json({
      status: "Success",
      message: "Industry Type created successfully",
      data: response,
    });
  } catch (error) {
    console.error("createIndustryTypeController error ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: error.message || "Internal Server Error",
    });
  }
};



export const getIndustrySearchController = async (req, res) => {
  try {
    const {
      search,
      industry_name,
      industry_unique_ID,
      is_active,
      created_by,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const tenantID = req.headers["x-tenant-id"];

    const result = await getIndustrySearchServices(
      tenantID,
      search,
      industry_name,
      industry_unique_ID,
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



export const getIndustrytypesController = async (req, res) => {
    try {
        const tenateID = req.headers["x-tenant-id"];

        const response = await getIndustryTypeServices(tenateID)

        res.status(201).json({
            status: "Success",
            message: "Industry Type fetch successfully",
            data: response,
        });
    } catch (error) {
        console.error("createIndustryTypeController fetch  error ===>", error.message);
        res.status(500).json({
            status: "Failed",
            message: error.message || "Internal Server Error",
        });
    }
}

export const updateIndustryTypeController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params;

    
    // if (!tenantID) throw new Error("Tenant ID is required");
    // if (!id) throw new Error("Industry Unique ID is required");

    const {
      industry_name,
      description,
      is_active,
      created_by,
      updated_by,
    } = req.body;

    const image_url = req.file ? req.file.path : undefined;

    const updates = {};
    if (industry_name) updates.industry_name = industry_name;
    if (description) updates.description = description;
    if (is_active !== undefined)
      updates.is_active = is_active === "true" || is_active === true;
    if (created_by) updates.created_by = created_by;
    if (updated_by) updates.updated_by = updated_by;
    if (image_url) updates.image_url = image_url;

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
      message: error.message || "Internal Server Error",
    });
  }
};





export const deleteIndustrytypeController = async (req, res) => {
    try {

        const tenateID = req.headers["x-tenant-id"];
        const { id } = req.params

        const response = await deleteIndustryTypeServices(tenateID, id)
        res.status(200).json({
            status: "Success",
            message: "Industry Type deleted successfully",
            data: response,
        });
    } catch (error) {
        console.error("delete IndustryTypeController  error ===>", error.message);
        res.status(500).json({
            status: "Failed",
            message: error.message || "Internal Server Error",
        });
    }
}