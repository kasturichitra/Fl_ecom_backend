import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const industryTypeSchema = new mongoose.Schema(
    {
        industry_unique_ID: {
            type: String,
            required: true,
            unique: true,
        },
        industry_name: {
            type: String,
            required: true,
            trim: true,
        },
        // industry_code: {
        //   type: String,
        //   trim: true,
        // },
        image_url: {
            type: String,

        },
        description: {
            type: String,
            trim: true,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        created_by: {
            type: String,
            trim: true,
        },
        updated_by: {
            type: String,
            trim: true,
        },

    },
    { timestamps: true }
);


const IndustryTypeModel = async (tenantID) => {
    const db = await getTenanteDB(tenantID)
    return db.models.IndustryType || db.model("IndustryType", industryTypeSchema)
}

export default IndustryTypeModel
