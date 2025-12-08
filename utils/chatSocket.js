import TicketModel from "../Tickets/ticketModel.js";

const chatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("Chat Socket connected:", socket.id);

        // Join a specific ticket room
        socket.on("joinTicket", (ticketId) => {
            if (!ticketId) return;
            socket.join(`ticket_${ticketId}`);
            console.log(`User ${socket.id} joined ticket room: ticket_${ticketId}`);
        });

        // Handle sending a message
        socket.on("sendTicketMessage", async ({ ticketId, senderId, senderRole, message, tenantId }) => {
            try {
                if (!tenantId) {
                    console.error("Tenant ID is missing for chat message");
                    return;
                }

                const Ticket = await TicketModel(tenantId);

                const newMessage = {
                    sender_id: senderId,
                    sender_role: senderRole,
                    message: message,
                    timestamp: new Date(),
                };

                // Try to find by _id first, then by ticket_number
                let updatedTicket = null;

                // Check if ticketId is a valid ObjectId
                if (ticketId.match(/^[0-9a-fA-F]{24}$/)) {
                    updatedTicket = await Ticket.findByIdAndUpdate(
                        ticketId,
                        { $push: { conversation: newMessage } },
                        { new: true }
                    );
                }

                if (!updatedTicket) {
                    updatedTicket = await Ticket.findOneAndUpdate(
                        { ticket_number: ticketId },
                        { $push: { conversation: newMessage } },
                        { new: true }
                    );
                }

                if (updatedTicket) {
                    // Broadcast message to the room
                    io.to(`ticket_${ticketId}`).emit("receiveTicketMessage", newMessage);
                    console.log(`Message sent to ticket_${ticketId}`);
                } else {
                    console.error("Ticket not found for chat message:", ticketId);
                    socket.emit("error", { message: "Ticket not found" });
                }
            } catch (error) {
                console.error("Error sending ticket message:", error);
                socket.emit("error", { message: "Internal server error" });
            }
        });
    });
};

export default chatSocket;
