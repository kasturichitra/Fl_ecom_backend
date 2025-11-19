import parseFormData from "../utils/parseFormDataIntoJsonData.js";
import { createBrandService, getAllBrandsService, getBrandByIdService, updateBrandService } from "./brandService.js";

// Create Brand
export const createBrandController = async (req, res) => {
  try {
    let data = req.body;
    const tenantId = req.headers["x-tenant-id"];

    let parsedData = parseFormData(data, "categories");

    // If single file upload used: brand_image
    const brand_image = req.file ? req.file.path : undefined;

    // If multiple files:
    const brand_images = req.files.length ? req.files.map((f) => f.path) : [];

    parsedData = {
      ...parsedData,
      brand_image,
      brand_images,
    };

    const response = await createBrandService(tenantId, parsedData);

    res.status(201).json({
      status: "Success",
      message: "Brand created successfully",
      data: response,
    });
  } catch (error) {
    console.error("Create Brand Controller Error ===>", error);
    res.status(500).json({
      status: "Failed",
      message: "Error creating brand",
      error: error.message,
    });
  }
};

// Get All Brands
export const getAllBrandsController = async (req, res) => {
  try {
    const filters = req.query;
    const tenantId = req.headers["x-tenant-id"];

    const response = await getAllBrandsService(tenantId, filters);

    res.status(200).json({
      status: "Success",
      message: "Fetched brands successfully",
      data: response,
    });
  } catch (error) {
    console.error("Get All Brands Error ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Error fetching brands",
      error: error.message,
    });
  }
};

// Get Brand by ID
export const getBrandByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.headers["x-tenant-id"];

    const response = await getBrandByIdService(tenantId, id);

    res.status(200).json({
      status: "Success",
      message: "Brand fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Get Brand By ID Error ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Error fetching brand",
      error: error.message,
    });
  }
};

// Update Brand By Id
export const updateBrandController = async (req, res) => {
  try {
    console.log("Request body is ===>", req.body);

    const { id } = req.params;
    const updateBrand = req.body;
    const tenantId = req.headers["x-tenant-id"];

    // Optional file update
    if (req.file) {
      updateBrand.brand_image = req.file.path;
    }

    if (req.files) {
      updateBrand.brand_images = req.files.map((f) => f.path);
    }

    const response = await updateBrandService(tenantId, id, updateBrand);

    res.status(200).json({
      status: "Success",
      message: "Brand updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Update Brand Controller Error ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Failed to update brand",
      error: error.message,
    });
  }
};
