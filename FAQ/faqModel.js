import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const faqSchema = new mongoose.Schema(
  {
    // 🔑 Unique readable ID (stable forever)
    question_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ❓ Question & Answer
    question_text: {
      type: String,
      required: true,
      trim: true,
    },

    answer_text: {
      type: String,
      trim: true,
    },

    // 📂 Classification
    issue_type: {
      type: String,
      enum: ["order", "payment", "delivery", "returns", "account", "general"],
      required: true,
      index: true,
    },

    sub_category: {
      type: String,
      trim: true,
    },

    // 🌳 Flow control
    type: {
      type: String,
      enum: ["root", "followup", "leaf"],
      required: true,
    },

    parent_question_id: {
      type: String,
      default: null,
      index: true,
    },

    next_questions: [
      {
        type: String, // stores question_id
      },
    ],

    // 🚨 Escalation
    escalation_allowed: {
      type: Boolean,
      default: false,
    },

    escalation_label: {
      type: String,
      default: "Still need help?",
    },

    // 🔢 UI ordering
    priority: {
      type: Number,
      default: 0,
      index: true,
    },

    // 🔍 Search support
    keywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // 👤 Ownership
    created_by: {
      type: String,
      enum: ["system", "admin"],
      default: "system",
    },

    // ⚙️ Flags
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // 🔁 Versioning (optional but gold)
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const FaqModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Faq || db.model("Faq", faqSchema);
};

export default FaqModel;
