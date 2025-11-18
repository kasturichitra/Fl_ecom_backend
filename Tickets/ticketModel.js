import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: true,
      unique: true,
    },
    // tenant_ID: {
    //     type: String,
    //     required: true
    // },
    user_id: {
      type: String,
      required: true,
    },
    order_id: { type: String },
    product_id: { type: String },

    issue_type: {
      type: String,
      required: true,
      enum: ["Order Issue", "Payment Issue", "Delivery Delay", "Refund", "Product Issue", "Account Issue", "Other"],
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachments: [{ type: String }],

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed", "Rejected"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    assigned_to: { type: String },
    resolution_notes: { type: String },
    resolved_at: { type: Date },

    // conversation: [
    //     {
    //         sender_type: { type: String, enum: ["User", "Admin"], required: true },
    //         message: { type: String, required: true },
    //         sent_at: { type: Date, default: Date.now },
    //     },
    // ],
  },
  { timestamps: true }
);

const TicketModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Tickets || db.model("Tickets", ticketSchema);
};

export default TicketModel;
