import {
  createReviewsServices,
  getAllReviewsServices,
  getReviewsByIdServices,
  // getReviewsBySearchServices,
  updateReviewsByIdServices,
} from "./productReviewService.js";

export const createReviewsController = async (req, res) => {
  try {
    let data = req.body;

    const images = req.files ? req.files.path : [];
    const tenantId = req.headers["x-tenant-id"];

    data = {
      ...data,
      images,
    };

    const response = await createReviewsServices(tenantId, data);
    res.status(201).json({
      status: "Success",
      message: "Review created successfully",
      data: response,
    });
  } catch (error) {
    console.error("Create Review Controller Error ===>", error);
    res.status(500).json({
      status: "Failed",
      message: "Error creating review",
      error: error.message,
    });
  }
};

// export const getReviewsBySearchController = async (req, res) => {
//   try {
//     const filters = req.query;
//     const tenantID = req.headers["x-tenant-id"];
//     const response = await getReviewsBySearchServices({
//       tenantID, 
//       filters
//     });

//     res.status(200).json({
//       status: "Success",
//       message: "Reviews fetched successfully with pagination",
//       data: response,
//     });
//   } catch (error) {
//     console.error("Get Reviews by Search Controller Error ===>", error.message);
//     res.status(500).json({
//       status: "Failed",
//       message: "Error fetching reviews",
//       error: error.message,
//     });
//   }
// };

export const getAllReviewsController = async (req, res) => {
  try {
    const filters = req.query;
    const tenantID = req.headers["x-tenant-id"];
    const response = await getAllReviewsServices(tenantID, filters);
    res.status(200).json({
      status: "Success",
      message: "Fetched Reviews successfully",
      data: response,
    });
  } catch (error) {
    console.log("Get Reviews are Failed====>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

export const getReviewsByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantID = req.headers["x-tenant-id"];
    
    const response = await getReviewsByIdServices(tenantID, id);

    res.status(200).json({
      status: "Success",
      message: "Review fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Get review by ID failed ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Error fetching review",
      error: error.message,
    });
  }
};

export const updateReviewsByIdController = async (req, res) => {
  try {
    console.log("Request body is ===>", req.body);
        
    const { id } = req.params;
    const updateReview = req.body;
    const tenantID = req.headers["x-tenant-id"];

    console.log("Request body is ===>", req.body);

    const response = await updateReviewsByIdServices(
      tenantID,
      id,
      updateReview
    );

    res.status(200).json({
      status: "Success",
      message: "Review updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Update review controller error ===>", error.message);
    res.status(500).json({
      status: "Failed",
      message: "Failed to update review",
      error: error.message,
    });
  }
};
