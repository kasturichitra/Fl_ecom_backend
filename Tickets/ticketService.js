import throwIfTrue from "../utils/throwIfTrue.js";
import TicketModel from "./ticketModel.js";

// ----------------- CREATE TICKET -----------------
export const createTicketService = async (tenantID, ticketData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const ticketDB = await TicketModel(tenantID);
  return ticketDB.create(ticketData);
};

// ----------------- GET ALL TICKETS -----------------
export const getAllTicketsService = async (tenantID) => {
  throwIfTrue(!tenantID, "Tenant ID is required");

  const ticketDB = await TicketModel(tenantID);
  return ticketDB.find().sort({ createdAt: -1 });
};

// ----------------- UPDATE TICKET -----------------
export const updateTicketService = async (tenantID, ticketId, updateData) => {
  throwIfTrue(!tenantID, "Tenant ID is required");
  throwIfTrue(!ticketId, "Ticket ID is required");

  const ticketDB = await TicketModel(tenantID);

  return ticketDB.findOneAndUpdate(
    { ticket_id: ticketId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};



// import throwIfTrue from "../utils/throwIfTrue.js";
// import TicketModel from "./ticketModel.js";

// export const createTicketService = async (tenantID, ticketData) => {
//   // if (!tenantID) throw new Error("Tenant ID is required");
//   throwIfTrue(!tenantID, "Tenant ID is required");

//   const ticketModelDB = await TicketModel(tenantID);
//   const response = await ticketModelDB.create(ticketData);

//   return response;
// };

// export const getAllTicketsService = async (tenantID) => {
//   // if (!tenantID) throw new Error("Tenant ID is required");
//   throwIfTrue(!tenantID, "Tenant ID is required");

//   const ticketModelDB = await TicketModel(tenantID);

//   const response = await ticketModelDB.find().sort({ createdAt: -1 });

//   return response;
// };

// export const updateTicketService = async (tenantID, ticketId, updateData) => {
//   // if (!tenantID) throw new Error("Tenant ID is required");
//   // if (!ticketId) throw new Error("Ticket ID is required");
//   throwIfTrue(!tenantID, "Tenant ID is required");
//   throwIfTrue(!ticketId, "Ticket ID is required");

//   const ticketModelDB = await TicketModel(tenantID);

//   const updatedTicket = await ticketModelDB.findOneAndUpdate(
//     { ticket_id: ticketId },
//     { $set: updateData },
//     { new: true, runValidators: true }
//   );

//   return updatedTicket;
// };
