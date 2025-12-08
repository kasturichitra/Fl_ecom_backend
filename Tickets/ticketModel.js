import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

// Single message schema
const chatMessageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: String,
      required: true,
    },
    sender_role: {
      type: String,
      enum: ["user", "admin", "support", "employee"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Pure chat room (no ticket fields)
const chatSchema = new mongoose.Schema(
  {
    chat_id: {
      type: String,
      required: true,
      unique: true,
    },

    users: {
      type: [String], // (user + admin/support)
      required: true,
      index: true,
    },

    messages: [chatMessageSchema],
  },
  {
    timestamps: true,
  }
);

const ChatModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);

  return db.models.Chat || db.model("Chat", chatSchema);
};

export default ChatModel;











// import mongoose from "mongoose";
// import { getTenanteDB } from "../Config/tenantDB.js";

// const conversationSchema = new mongoose.Schema(
//   {
//     sender_id: {
//       type: String,
//       required: true,
//     },
//     sender_role: {
//       type: String,
//       enum: ["user", "admin", "support", "employee"],
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true,
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now,
//     },
//     read: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { _id: false }
// );

// const ticketSchema = new mongoose.Schema(
//   {
//     ticket_number: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     // User id of the user who created the ticket
//     user_id: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     order_id: {
//       type: String,
//     },
//     issue_type: {
//       type: String,
//       required: true,
//       enum: [
//         "Order",
//         "Payment",
//         "Delivery",
//         "Refund",
//         "Product",
//         "Account",
//         "Other",
//       ],
//       index: true,
//     },
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     status: {
//       type: String,
//       enum: ["Open", "In Progress", "Resolved", "Closed", "Rejected"],
//       default: "Open",
//     },
//     priority: {
//       type: String,
//       enum: ["Low", "Medium", "High", "Urgent"],
//       default: "Medium",
//     },
//     assigned_to: {
//       type: String,
//       trim: true,
//       index: true
//     },
//     conversation: [conversationSchema],

//     resolved_at: {
//       type: Date,
//     },
//     closed_at: {
//       type: Date,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const TicketModel = async (tenantID) => {
//   const db = await getTenanteDB(tenantID);

//   return db.models.Tickets || db.model("Tickets", ticketSchema);
// };

// export default TicketModel;


