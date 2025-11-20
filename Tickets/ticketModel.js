import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,                //  User ticket history becomes fast
    },
    order_id: { 
      type: String,
    },
    product_id: { 
      type: String,
    },

    issue_type: {
      type: String,
      required: true,
      enum: [
        "Order Issue",
        "Payment Issue",
        "Delivery Delay",
        "Refund",
        "Product Issue",
        "Account Issue",
        "Other",
      ],
      index: true,                //Filter by type becomes fast
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    attachments: [{ type: String }],

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed", "Rejected"],
      default: "Open",
      index: true,                //  Status filters are common
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,                // Reporting by priority becomes fast
    },

    assigned_to: { 
      type: String,
      trim: true,
      index: true                 // Agent-wise ticket list becomes fast
    },

    resolution_notes: { type: String },
    resolved_at: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,         
    strict: true,                // Prevents unwanted fields
  }
);

// ---------------------------------
// Additional Compound Indexes
// ---------------------------------

// Most common filters in dashboards
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ user_id: 1, status: 1 });
ticketSchema.index({ assigned_to: 1, status: 1 });

// ---------------------------------
// MODEL CREATION
// ---------------------------------
const TicketModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);

  return db.models.Tickets || db.model("Tickets", ticketSchema);
};

export default TicketModel;



// import mongoose from "mongoose";
// import { getTenanteDB } from "../Config/tenantDB.js";

// const ticketSchema = new mongoose.Schema(
//   {
//     ticket_id: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     // tenant_ID: {
//     //     type: String,
//     //     required: true
//     // },
//     user_id: {
//       type: String,
//       required: true,
//     },
//     order_id: { type: String },
//     product_id: { type: String },

//     issue_type: {
//       type: String,
//       required: true,
//       enum: ["Order Issue", "Payment Issue", "Delivery Delay", "Refund", "Product Issue", "Account Issue", "Other"],
//     },
//     subject: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     attachments: [{ type: String }],

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
//     assigned_to: { type: String },
//     resolution_notes: { type: String },
//     resolved_at: { type: Date },

//     // conversation: [
//     //     {
//     //         sender_type: { type: String, enum: ["User", "Admin"], required: true },
//     //         message: { type: String, required: true },
//     //         sent_at: { type: Date, default: Date.now },
//     //     },
//     // ],
//   },
//   { timestamps: true }
// );

// const TicketModel = async (tenantID) => {
//   const db = await getTenanteDB(tenantID);
//   return db.models.Tickets || db.model("Tickets", ticketSchema);
// };

// export default TicketModel;
