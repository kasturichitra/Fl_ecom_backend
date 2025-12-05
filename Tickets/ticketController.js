import UserModel from "../Users/userModel.js";
import { BOT_REPLIES } from "../utils/chatBotreplies.js";
import { sendEmailToAdmin } from "../utils/sendEmail.js";
import {
  createTicketService,
  getAllTicketsService,
  getTicketByIdService,
  updateTicketService,
  addMessageToTicketService
} from "./ticketService.js";


// Common function for sending error response
const sendError = (res, code, msg) =>
  res.status(code).json({ status: "failed", message: msg });

// ---------------------- Create Ticket ----------------------
export const createTicketController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const userModelDB = await UserModel(tenantID)
    const response = await createTicketService(tenantID, req.body);
    const existAdmin = await userModelDB.findOne({ role: "admin" })

    if (existAdmin.email) {
      sendEmailToAdmin(existAdmin.email, response)
    }

    return res.status(201).json({
      status: "success",
      message: "Ticket created successfully",
      data: response,
    });
  } catch (error) {
    console.error("Ticket creation error:", error);
    return sendError(res, 500, error);
  }
};


// ---------------------- Add Message to Ticket ----------------------
export const addMessageToTicketController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];

    const updatedTicket = await addMessageToTicketService(tenantID, req.body);

    return res.status(200).json({
      status: "success",
      message: "Message added successfully",
      data: updatedTicket,
    });

  } catch (error) {
    console.error("Error adding message to ticket:", error);
    return sendError(res, 500, error.message || "Internal Server Error");
  }
};
// ---------------------- Get All Tickets ----------------------
export const getAllTicketsController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    if (!tenantID) return sendError(res, 400, "Tenant ID is required in headers");

    // Optional: Add query filtering (e.g. by user_id or status)
    const query = {};
    if (req.query.user_id) query.user_id = req.query.user_id;
    if (req.query.status) query.status = req.query.status;
    if (req.query.assigned_to) query.assigned_to = req.query.assigned_to;

    const response = await getAllTicketsService(tenantID, query);

    return res.status(200).json({
      status: "success",
      message: "Tickets fetched successfully",
      total: response.length,
      data: response,
    });
  } catch (error) {
    console.error("Get Ticket Error:", error.message);
    return sendError(res, 500, error.message);
  }
};

// ---------------------- Get Ticket By ID ----------------------
export const getTicketByIdController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params;

    if (!tenantID) return sendError(res, 400, "Tenant ID is required in headers");
    if (!id) return sendError(res, 400, "Ticket ID is required in params");

    const response = await getTicketByIdService(tenantID, id);

    if (!response) return sendError(res, 404, "Ticket not found");

    return res.status(200).json({
      status: "success",
      message: "Ticket fetched successfully",
      data: response,
    });
  } catch (error) {
    console.error("Get Ticket By ID Error:", error.message);
    return sendError(res, 500, error.message);
  }
};

// ---------------------- Update Ticket ----------------------
export const updateTicketController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params;
    const updateData = req.body;

    if (!tenantID) return sendError(res, 400, "Tenant ID is required in headers");
    if (!id) return sendError(res, 400, "Ticket ID is required in params");
    if (!updateData || !Object.keys(updateData).length)
      return sendError(res, 400, "Update data is required");

    const updatedTicket = await updateTicketService(tenantID, id, updateData);

    if (!updatedTicket)
      return sendError(res, 404, "Ticket not found");

    return res.status(200).json({
      status: "success",
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Ticket update error:", error.message);
    return sendError(res, 500, error.message);
  }
};
