import mongoose from "mongoose";

export const imageSchema = new mongoose.Schema(
  {
    original: {
      type: String,
      trim: true,
    },
    medium: {
      type: String,
      trim: true,
    },
    low: {
      type: String,
      trim: true,
    },
  },
  { _id: false } // 🔥 prevents extra _id for subdocument
);