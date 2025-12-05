import { generateTicketNumber } from "../utils/generateTicketId.js";
import throwIfTrue from "../utils/throwIfTrue.js";
import TicketModel from "./ticketModel.js";

// ----------------- CREATE TICKET -----------------
export const createTicketService = async (tenantID, ticketData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  const ticketDB = await TicketModel(tenantID);

  const ticketNumber = await generateTicketNumber(ticketDB);

  ticketData.ticket_number = ticketNumber;

  console.log(ticketData, 'cjecking the ticket data');
  return ticketDB.create(ticketData);
};

// ----------------- ADD MESSAGE TO TICKET -----------------
export const addMessageToTicketService = async (tenantID, ticketId, messageData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!ticketId, "Ticket ID is required");

  const ticketDB = await TicketModel(tenantID);

  let updatedTicket = null;

  // Check if it's a valid ObjectId
  if (ticketId.match(/^[0-9a-fA-F]{24}$/)) {
    updatedTicket = await ticketDB.findByIdAndUpdate(
      ticketId,
      { $push: { conversation: messageData } },
      { new: true }
    );
  } else {
    updatedTicket = await ticketDB.findOneAndUpdate(
      { ticket_number: ticketId },
      { $push: { conversation: messageData } },
      { new: true }
    );
  }

  return updatedTicket;
};

// ----------------- GET ALL TICKETS -----------------
export const getAllTicketsService = async (tenantID, query = {}) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const ticketDB = await TicketModel(tenantID);
  return ticketDB.find(query).sort({ createdAt: -1 });
};

// ----------------- GET TICKET BY ID -----------------
export const getTicketByIdService = async (tenantID, ticketId) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!ticketId, "Ticket ID is required");

  const ticketDB = await TicketModel(tenantID);

  // Try to find by _id first, if fails or not found, try by ticket_number
  if (ticketId.match(/^[0-9a-fA-F]{24}$/)) {
    const ticket = await ticketDB.findById(ticketId);
    if (ticket) return ticket;
  }

  return ticketDB.findOne({ ticket_number: ticketId });
};

// ----------------- UPDATE TICKET -----------------
export const updateTicketService = async (tenantID, ticketId, updateData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!ticketId, "Ticket ID is required");

  const ticketDB = await TicketModel(tenantID);

  // Check if it's a valid ObjectId
  if (ticketId.match(/^[0-9a-fA-F]{24}$/)) {
    return ticketDB.findByIdAndUpdate(
      ticketId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  } else {
    return ticketDB.findOneAndUpdate(
      { ticket_number: ticketId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
};

