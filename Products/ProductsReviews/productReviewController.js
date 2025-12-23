import { errorResponse, successResponse } from "../../utils/responseHandler.js";
import throwIfTrue from "../../utils/throwIfTrue.js";
import {
  createReviewService,
  getAllReviewsService,
  getRatingSummaryService,
  getReviewByIdService,
  // getReviewsBySearchServices,
  updateReviewService,
} from "./productReviewService.js";

export const createReviewController = async (req, res) => {
  try {
    let { image_base64, ...data } = req.body;

    const tenantId = req.headers["x-tenant-id"];

    let imagesFileBuffer = [];

    if (image_base64) {
      const base64Array = Array.isArray(image_base64) ? image_base64 : [image_base64];
      throwIfTrue(base64Array.length > 5, "Only 5 images can be uploaded at a time");

      imagesFileBuffer = base64Array.map((base64Image) => {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        return Buffer.from(base64Data, "base64");
      });
    }

    const response = await createReviewService(tenantId, data, imagesFileBuffer);

    res.status(201).json(successResponse("Review created successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
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
    res.status(200).json(successResponse("Fetched Reviews successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getReviewByIdController = async (req, res) => {
  try {
    const { id: product_unique_id } = req.params;
    const tenantId = req.headers["x-tenant-id"];

    const response = await getReviewByIdService(tenantId, product_unique_id);
    res.status(200).json(successResponse("Review fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getRatingSummaryController = async (req, res) => {
  try {
    const filters = req.query;
    const tenantId = req.headers["x-tenant-id"];
    const response = await getRatingSummaryService(tenantId, filters);
    res.status(200).json(successResponse("Fetched Rating Summary successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateReviewController = async (req, res) => {
  try {
    const { id } = req.params;
    const { image_base64, ...payload } = req.body;

    const tenantId = req.headers["x-tenant-id"];

    let imagesFileBuffer = [];

    if (image_base64) {
      const base64Array = Array.isArray(image_base64) ? image_base64 : [image_base64];
      throwIfTrue(base64Array.length > 5, "Only 5 images can be uploaded at a time");

      imagesFileBuffer = base64Array.map((base64Image) => {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        return Buffer.from(base64Data, "base64");
      });
    }

    const response = await updateReviewService(tenantId, id, payload, imagesFileBuffer);
    res.status(200).json(successResponse("Review updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
