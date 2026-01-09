import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";


const businessSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    gstinNumber: {
        type: String,
        required: true,
    },
    business_name: {
        type: String,
        required: true,
    },
    business_address: {
        type: String,
        required: true,
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    verification_date: {
        type: Date,
        default: null,
    },
    assigned_to: {
        type: String,
        default: null,
    },
    total_tax_paid: {
        type: Number,
    },
    current_year: {
        type: Number,
    },
    images: {
        type: Array,
        default: [],
        max: 5,
    },
    documents: {
        type: Array,
        default: [],
        max: 5,
    },
    business_unique_id: {
        type: String,
        default: null,
    },
    is_active: {
        type: Boolean,
        default: true,
    }
});

export const BusinessModel = async (tenantID) => {
    const db = await getTenanteDB(tenantID);
    return db.models.Business || db.model("Business", businessSchema);
};