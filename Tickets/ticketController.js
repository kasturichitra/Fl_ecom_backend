import { BOT_REPLIES } from "../utils/chatBotreplies.js";
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
    const { user_id, order_id, issue_type, title, description, priority, assigned_to } = req.body;

    // Basic validation
    if (!user_id || !issue_type || !title || !description) {
      return sendError(res, 400, "Missing required fields: user_id, issue_type, title, description");
    }

    const ticketData = {
      user_id,
      order_id,
      issue_type,
      title,
      description,
      priority: priority || "Medium",
      assigned_to,
      status: "Open"
    };

    const response = await createTicketService(tenantID, ticketData);

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
export const addMessageController = async (req, res) => {
  try {
    const tenantID = req.headers["x-tenant-id"];
    const { id } = req.params;
    const { sender_id, sender_role, message } = req.body;

    if (!sender_id || !sender_role || !message)
      return sendError(res, 400, "sender_id, sender_role, and message are required");

    const messageData = {
      sender_id,
      sender_role,
      message,
      timestamp: new Date(),
      read: false
    };

    // Save User Message
    const updatedTicket = await addMessageToTicketService(tenantID, id, messageData);

    if (!updatedTicket)
      return sendError(res, 404, "Ticket not found");

    // Emit user message
    req.io?.to(`ticket_${id}`).emit("receiveTicketMessage", messageData);


    // ============================
    //  AUTO BOT SMART MATCH REPLY
    // ============================

    const userMsg = message.toLowerCase().trim();

    // Find best matching BOT message (closest match)
    const matchedKey = Object.keys(BOT_REPLIES).find(key => {
      return userMsg.includes(key.toLowerCase());
    });

    if (matchedKey) {
      const botMessage = {
        sender_id: "system",
        sender_role: "support",
        message: BOT_REPLIES[matchedKey],
        timestamp: new Date(),
        read: false
      };

      await addMessageToTicketService(tenantID, id, botMessage);
      req.io?.to(`ticket_${id}`).emit("receiveTicketMessage", botMessage);
    }

    return res.status(200).json({
      status: "success",
      message: "Message added successfully",
      data: updatedTicket,
    });

  } catch (error) {
    console.error("Add Message error:", error.message);
    return sendError(res, 500, error.message);
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
