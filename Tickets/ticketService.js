import TicketsModel from "./ticketModel.js";

export const createTicketServices = async (tenantID, ticketData) => {
    // try {
        if (!tenantID) throw new Error("Tenant ID is required");

        const ticketModelDB = await TicketsModel(tenantID);
        const response = await ticketModelDB.create(ticketData);

        return response;
    // } catch (error) {
    //     console.error("Ticket creation failed:", error.message);
    //     throw new Error(error.message);
    // }
};



export const getTicketServices = async (tenantID) => {
  // try {
    if (!tenantID) throw new Error("Tenant ID is required");

    const ticketModelDB = await TicketsModel(tenantID);

    const response = await ticketModelDB.find().sort({ createdAt: -1 });

    return response;
  // } catch (error) {
  //   console.error("Ticket fetch error ===>", error.message);
  //   throw new Error(error.message);
  // }
};


export const updateTicketServices = async (tenantID, ticketID, updateData) => {
  // try {
    if (!tenantID) throw new Error("Tenant ID is required");
    if (!ticketID) throw new Error("Ticket ID is required");

    const ticketModelDB = await TicketsModel(tenantID);

    const updatedTicket = await ticketModelDB.findOneAndUpdate(
      { ticket_ID: ticketID },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return updatedTicket;
  // } catch (error) {
  //   console.error("Ticket update service error ===>", error.message);
  //   throw new Error(error.message);
  // }
};