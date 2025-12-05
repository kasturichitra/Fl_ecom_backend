import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const configSchema = new mongoose.Schema(
  {
    theme: {
      mode: { type: String, enum: ["light", "dark"], default: "light" },
      colors: {
        primary: String,
        secondary: String,
        background: String,
        text: String,
        ghost: String,
        destructive: String,
      },
      typography: {
        font_family: String,
        heading_size: Number,
        body_size: Number,
      },
      //   layout: {
      //     type: String, // boxed / full / minimal
      //     default: "boxed",
      //   },
    },

    ui_settings: {
      show_search_bar: Boolean,
      show_categories: Boolean,
      show_banner: Boolean,
      infinite_scroll: Boolean,
    },

    email_settings: {
      from_email: String,
      templates: {
        order_confirmation: String,
        forgot_password: String,
        otp: String,
      },
    },

    payment_settings: {
      razorpay: {
        key: String,
        secret: String,
        enabled: Boolean,
      },
      stripe: {
        key: String,
        secret: String,
        enabled: Boolean,
      },
    },

    seo: {
      meta_title: String,
      meta_description: String,
      keywords: [String],
    },

    feature_flags: {
      enable_discount: Boolean,
      enable_tax: Boolean,
      enable_reviews: Boolean,
      enable_inventory: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const ConfigModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.Config || db.model("Config", configSchema);
};

export default ConfigModel;
