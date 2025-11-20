import {
  createReviewService,
  getAllReviewsService,
  getReviewByIdService,
  // getReviewsBySearchServices,
  updateReviewService,
} from "./productReviewService.js";

export const createReviewController = async (req, res) => {
  try {
    let data = req.body;

    const images = req.files ? req.files.path : [];
    const tenantId = req.headers["x-tenant-id"];

    data = {
      ...data,
      images,
    };

    const response = await createReviewService(tenantId, data);
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
//     const tenantId = req.headers["x-tenant-id"];
//     const response = await getReviewsBySearchServices({
//       tenantId,
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
    const tenantId = req.headers["x-tenant-id"];
    const response = await getAllReviewsService(tenantId, filters);
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

export const getReviewByIdController = async (req, res) => {
  try {
    const { id: product_unique_id } = req.params;
    const tenantId = req.headers["x-tenant-id"];

    const response = await getReviewByIdService(tenantId, product_unique_id);

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

export const updateReviewController = async (req, res) => {
  try {
    console.log("Request body is ===>", req.body);

    const { id } = req.params;
    const updateReview = req.body;
    const tenantId = req.headers["x-tenant-id"];

    console.log("Request body is ===>", req.body);

    const response = await updateReviewService(tenantId, id, updateReview);

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
