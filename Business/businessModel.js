import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";


const businessSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    total_tax_paid:{
        type: Number,
        required: true,
    },
    current_year:{
        type: Number,
        required: true,
    }
});

export const BusinessModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Business || db.model("Business", businessSchema);
};