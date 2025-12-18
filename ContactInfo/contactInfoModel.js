import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const contactInfoSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            // required: true,
        },
        phone_number: {
            type: String,
            // required: true,
        },
        address: {
            type: String,
            // required: true,
        },
        instagram_link: {
            type: String,
            // required: true,
        },
        facebook_link: {
            type: String,
            // required: true,
        },
        twitter_link: {
            type: String,
            // required: true,
        },
        about_us: {
            type: String,
            // required: true,
        },
        terms_and_conditions: {
            type: String,
            // required: true,
        },
        privacy_policy: {
            type: String,
            // required: true,
        },
        logo_image: {
            type: String,
            // required: false,
        },
        // Green color top of the website text
        navbar_banner_text: {
            type: String,
            // required: false,
        }
    },
    { timestamps: true }
);

const ContactInfoModel = async (tenantID) => {
    const db = await getTenanteDB(tenantID);
    return db.models.ContactInfo || db.model("ContactInfo", contactInfoSchema);
};

export default ContactInfoModel;