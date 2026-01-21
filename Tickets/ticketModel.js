import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";
import { imageSchema } from "../lib/imageModel.js";

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 👤 User who raised ticket
    raised_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    user_email: {
      type: String,
      required: true,
    },

    // 🔗 FAQ context
    faq_question_id: {
      type: String,
      required: true,
    },

    faq_path: {
      type: [String], // ["FAQ-ROOT-ORDER", "FAQ-ORDER-DELAY"]
      default: [],
    },

    order_id: {
      type: String,
    },

    // 📝 User message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // 📊 Status lifecycle
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "resolved"],
      default: "pending",
      index: true,
    },

    // Priority of ticket is like the importance // Low, medium, high
    priority: {
      type: String, 
      enum: ["low", "medium", "high", "critical"],
    }, 

    // 👨‍💼 Assignment
    assigned_to: {
      type: String,
    },

    assigned_at: Date,

    // 👤 Admin actions
    resolved_by: {
      type: String,
    },

    relevant_images: [imageSchema],

    // Is prohibited is an admin controlled action to prevent users from creating any similar tickets
    is_prohibited: {
      type: Boolean,
    },

    resolved_at: Date,
  },
  { timestamps: true }
);

const TicketModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.Ticket || db.model("Ticket", ticketSchema);
};

export default TicketModel;
