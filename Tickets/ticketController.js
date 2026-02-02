import { errorResponse, successResponse } from "../utils/responseHandler.js";
import {
  assignTicketService,
  createTicketService,
  getAllTicketsService,
  getTicketByIdService,
  getUserTicketForOrderService,
  resolveTicketService,
  updateTicketService,
} from "./ticketService.js";

export const createTicketController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const { relevant_images, ...data } = req.body;

    let relevantImagesBuffers = [];

    // Handle multiple relevant_images (gallery)
    if (relevant_images && Array.isArray(relevant_images)) {
      relevantImagesBuffers = relevant_images.map((base64Image) => {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        return Buffer.from(base64Data, "base64");
      });
    }

    const payload = {
      ...data,
      raised_by: req.user.user_id.toString(),
      user_email: req.user.email,
    };

    console.log("payload", payload);
    const response = await createTicketService(tenantId, payload, relevantImagesBuffers);

    res.status(201).json(successResponse("Ticket created successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getAllTicketsController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    const filters = req.query;

    const response = await getAllTicketsService(tenantId, filters);

    res.status(200).json(successResponse("Tickets fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getUserTicketForOrderController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: order_id } = req.params;

    const response = await getUserTicketForOrderService(tenantId, order_id);

    res.status(200).json(successResponse("User Ticket for order fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const getTicketByIdController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: ticket_id } = req.params;

    const response = await getTicketByIdService(tenantId, ticket_id);

    res.status(200).json(successResponse("Ticket fetched successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const assignTicketController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: ticket_id } = req.params;

    const payload = {
      ...req.body,
      ticket_id,
    };

    const response = await assignTicketService(tenantId, payload);

    res.status(200).json(successResponse("Ticket assigned successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const resolveTicketController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: ticket_id } = req.params;

    const user_id = req.body.resolved_by || req.user._id.toString();

    const { resolved_by, ...rest } = req.body;

    const payload = {
      ...rest,
      resolved_by: user_id,
      ticket_id,
    };

    const response = await resolveTicketService(tenantId, payload);

    res.status(200).json(successResponse("Ticket resolved successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};

export const updateTicketController = async (req, res) => {
  try {
    const tenantId = req.headers["x-tenant-id"];
    const { id: ticket_id } = req.params;
    const payload = req.body;

    const response = await updateTicketService(tenantId, ticket_id, payload);

    res.status(200).json(successResponse("Ticket updated successfully", { data: response }));
  } catch (error) {
    res.status(500).json(errorResponse(error.message, error));
  }
};
