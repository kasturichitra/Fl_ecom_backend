import { json } from "express";
import {
  createCategoryServices,
  deleteCategoryServices,
  getAllCategoriesSerices,
  getAllCategorySearchServices,
  getCategoryByIdServices,
  updateCategoryServices,
} from "./categoryService.js";
import fs from "fs";
import throwIfTrue from "../utils/throwIfTrue.js";



export const createCategoryController = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const {
      industry_unique_ID,
      category_name,
      // category_brand,
      category_unique_Id,
      created_by,
      // updated_by,
      attributes,
    } = req.body;


    console.log(req.body)

    const tenateID = req.headers["x-tenant-id"];    

    uploadedFilePath = req.file ? req.file.path : null;

    throwIfTrue(!uploadedFilePath, "Category image is required");

    let parsedAttributes = [];
    if (typeof attributes === "string") {
      try {
        parsedAttributes = JSON.parse(attributes);
      } catch (err) {
        console.warn("Invalid JSON format for attributes");
      }
    } else if (Array.isArray(attributes)) {
      parsedAttributes = attributes;
    }

    const newCategory = await createCategoryServices(
      tenateID,
      industry_unique_ID,
      category_unique_Id,
      category_name,
      // category_brand,
      uploadedFilePath,
      created_by,
      // updated_by,
      parsedAttributes
    );

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("Category creation failed in controller ===>", error.message);

    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
        console.log("Unused uploaded image deleted:", uploadedFilePath);
      } catch (unlinkErr) {
        console.error("Error deleting unused image:", unlinkErr.message);
      }
    }

    res.status(500).json({
      status: "failed",
      message: "Create category failed",
      error: error.message,
    });
  }
};


export const getAllCategoryController = async (req, res) => {
  try {

    const tenateID = req.headers["x-tenant-id"];
    const categorieData = await getAllCategoriesSerices(tenateID);
    res.status(200).json({
      status: "Success",
      message: "All Category data fetched successfully",
      data: categorieData,
    });
  } catch (error) {
    console.log("Get all date failed error===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Get all category error",
      error: error.message,
    });
  }
};



// export const getAllCategorySearchController = async (req, res) => {
//   try {
//     const {
//       category_name,
//       category_brand,
//       category_unique_Id,
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const tenateID = req.headers["x-tenant-id"];
//     const { categoryData, totalCount } = await getAllCategorySearchServices(
//       tenateID,
//       category_brand,
//       category_name,
//       category_unique_Id,
//       page,
//       limit
//     );

//     res.status(200).json({
//       status: "Success",
//       message: " Category Search data fetched successfully",
//       data: categoryData,
//       totalCount,
//     });
//   } catch (error) {
//     console.log("Category Data fetch failed====>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: "Get all category search error",
//       error: error.message,
//     });
//   }
// };

export const getAllCategorySearchController = async (req, res) => {
  try {
    const {
      category_name,
      category_brand,
      category_unique_Id,
      is_active,
      industry_unique_ID,
      search,     // 🔥 global search bar
      page = 1,
      limit = 10,
    } = req.query;

    const tenantID = req.headers["x-tenant-id"];

    const filters = {
      category_name,
      category_brand,
      category_unique_Id,
      is_active,
      industry_unique_ID,
    };

    const { categoryData, totalCount } = await getAllCategorySearchServices(
      tenantID,
      filters,
      search,
      page,
      limit
    );

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


export const getCategoryByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const tenateID = req.headers["x-tenant-id"];

    const categoryData = await getCategoryByIdServices(tenateID,id);

    res.status(200).json({
      status: "success",
      message: "Category get by ID data fetched successfully",
      data: categoryData,
    });
  } catch (error) {
    console.log("Category get data error", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Get category By ID error",
      error: error.message,
    });
  }
};



export const updateCategoryController = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params; // category_unique_Id
    const {
      category_name,
      category_brand,
      is_active,
      attributes, // array of attributes from frontend (JSON)
      updated_by,
    } = req.body;

    // if (!tenantID) throw new Error("Tenant ID is required");
    // if (!id) throw new Error("Category Unique ID is required");

    uploadedFilePath = req.file ? req.file.path : null;

    const updates = {};
    if (category_name) updates.category_name = category_name;
    if (category_brand) updates.category_brand = category_brand;
    if (is_active !== undefined) updates.is_active = is_active;
    if (updated_by) updates.updated_by = updated_by;
    if (uploadedFilePath) updates.category_image = uploadedFilePath;

    if (attributes) {
      try {
        updates.attributes =
          typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      } catch (err) {
        throw new Error("Invalid JSON format for attributes");
      }
    }

    const { updatedRecord, oldImagePath } = await updateCategoryServices(
      tenantID,
      id,
      updates
    );

    if (uploadedFilePath && oldImagePath && fs.existsSync(oldImagePath)) {
      try {
        fs.unlinkSync(oldImagePath);
        console.log("🗑️ Old category image deleted:", oldImagePath);
      } catch (unlinkErr) {
        console.error("⚠️ Error deleting old image:", unlinkErr.message);
      }
    }

    res.status(200).json({
      status: "Success",
      message: "Category updated successfully",
      data: updatedRecord,
    });

  } catch (error) {
    console.error(" Update Category Controller error:", error.message);

    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
        console.log("🗑️ Unused uploaded image deleted:", uploadedFilePath);
      } catch (unlinkErr) {
        console.error("⚠️ Error deleting unused image:", unlinkErr.message);
      }
    }

    res.status(500).json({
      status: "Failed",
      message: error.message || "Internal Server Error",
    });
  }
};




export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params; // category_unique_Id
    const tenantID = req.headers["x-tenant-id"];

    // if (!tenantID) {
    //   return res.status(400).json({
    //     status: "Failed",
    //     message: "Tenant ID is required",
    //   });
    // }

    // if (!id) {
    //   return res.status(400).json({
    //     status: "Failed",
    //     message: "category_unique_Id is required",
    //   });
    // }

    const deletedData = await deleteCategoryServices(tenantID, id);

    //  Remove image file if it exists
    if (deletedData?.category_image && fs.existsSync(deletedData.category_image)) {
      try {
        fs.unlinkSync(deletedData.category_image);
        console.log("Category image deleted:", deletedData.category_image);
      } catch (err) {
        console.error("Error deleting category image:", err.message);
      }
    }

    res.status(200).json({
      status: "Success",
      message: "Category deleted successfully",
      data: deletedData,
    });
  } catch (error) {
    console.log("Category delete failed in controller ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Category delete error",
      error: error.message,
    });
  }
};