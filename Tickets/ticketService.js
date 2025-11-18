import TicketModel from "./ticketModel.js";

export const createTicketService = async (tenantID, ticketData) => {
  // try {
  if (!tenantID) throw new Error("Tenant ID is required");

  const ticketModelDB = await TicketModel(tenantID);
  const response = await ticketModelDB.create(ticketData);

  return response;
  // } catch (error) {
  //     console.error("Ticket creation failed:", error.message);
  //     throw new Error(error.message);
  // }
};

export const getAllTicketsService = async (tenantID) => {
  // try {
  if (!tenantID) throw new Error("Tenant ID is required");

  const ticketModelDB = await TicketModel(tenantID);

  const response = await ticketModelDB.find().sort({ createdAt: -1 });

  return response;
  // } catch (error) {
  //   console.error("Ticket fetch error ===>", error.message);
  //   throw new Error(error.message);
  // }
};

export const updateTicketService = async (tenantID, ticketId, updateData) => {
  // try {
  if (!tenantID) throw new Error("Tenant ID is required");
  if (!ticketId) throw new Error("Ticket ID is required");

  const ticketModelDB = await TicketModel(tenantID);

  const updatedTicket = await ticketModelDB.findOneAndUpdate(
    { ticket_id: ticketId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedTicket;
  // } catch (error) {
  //   console.error("Ticket update service error ===>", error.message);
  //   throw new Error(error.message);
  // }
};
