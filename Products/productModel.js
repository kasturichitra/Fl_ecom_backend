import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const productSchema = new mongoose.Schema(
  {
    //  Relationships
    // subCategory_unique_ID: {
    //   type: String,
    //   required: true,
    // },
    category_unique_id: {
      type: String,
      required: true,
    },
    industry_unique_id: {
      type: String,
      required: true,
    },
    product_unique_id: {
      type: String,
      required: true,
      unique: true,
    },
    brand_unique_id: {
      type: String,
      required: true,
    },
    brand_name: {
      type: String,
    },
    category_name: {
      type: String,
    },

    // Basic Info
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    // product_code: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    product_slug: {
      type: String,
      trim: true,
    },
    product_description: {
      type: String,
      trim: true,
    },
    long_description: {
      type: String,
    },
    // Can be any sub clssification to catgeory - Optional in many cases - Useful in cases like footwear for clothing and fashion industry
    product_type: {
      type: String,
    },
    product_color: {
      type: String,
      trim: true,
    },
    // Product specified sizes like xl, xxl for clothing, shoe sizes for footwear etc
    product_size: {
      type: String,
      trim: true,
    },
    model_number: {
      type: String,
      trim: true,
    },
    sku: {
      type: String, //Stock Keeping Unit.
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },

    //  Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Optional price fields
    base_price: {
      type: Number,
      min: 0,
    },
    sale_price: {
      type: Number,
      min: 0,
    },
    cost_price: {
      type: Number,
      min: 0,
    },

    // Discount related info
    discount_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discount_price: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      trim: true,
      default: "INR",
    },
    discount_type: {
      type: String,
    },
    discount_coupon: {
      type: String,
    },

    // GST and  tax related info
    product_gst: {
      type: Number,
      default: 0,
    },
    gst_number: {
      type: String,
      trim: true,
    },
    cgst: {
      type: Number,
      min: 0,
    },
    igst: {
      type: Number,
      min: 0,
    },
    sgst: {
      type: Number,
      min: 0,
    },
    tax_value: {
      type: Number,
      min: 0,
    },

    //  Stock & Inventory
    stock_availability: {
      type: Boolean,
      required: true,
      default: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    min_order_limit: {
      type: Number,
      required: true,
      min: 1,
    },
    max_order_limit: {
      type: Number,
    },
    low_stock_threshold: {
      type: Number,
    },

    // Product Variants / Attributes
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex", "Kids", "Other"],
      default: "Unisex",
    },
    // age: {
    //   type: Number,
    //   min: 0,
    // },
    country_of_origin: {
      type: String,
      trim: true,
    },
    tag: {
      type: String,
      trim: true,
    },
    minimum_age: {
      type: Number,
      min: 0,
    },
    maximum_age: {
      type: Number,
      min: 0,
    },
    age_group: {
      type: String, // Like "Kids", "Teens", "Youth", "Old people"
      trim: true,
    },

    // Warranty & Policy
    product_warranty: {
      type: String,
      trim: true,
    },
    warranty_type: {
      type: String,
      trim: true,
    },
    return_policy: {
      type: String,
      trim: true,
    },
    replacement_available: {
      type: Boolean,
      default: true,
    },

    //  Shipping & Delivery
    shipping_charges: {
      type: Number,
      default: 0,
    },
    delivery_time: {
      type: String,
      trim: true,
    },
    cash_on_delivery: {
      type: Boolean,
      default: true,
    },

    // Media
    product_image: {
      type: String,
      trim: true,
    },
    product_images: {
      type: [String],
    },
    // product_video: {
    //   type: String,
    //   trim: true,
    // },

    // Product Attributes like RAM, ROM, Color, Size etc for different cateqories
    product_attributes: [
      {
        attribute_code: {
          type: String, // e.g., "ram_gb", "camera_mp"
          required: true,
          trim: true,
        },
        value: {
          type: mongoose.Schema.Types.Mixed, // e.g. 8gb, 50mp etc
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ProductModel = async (tenantID) => {
  const db = await getTenanteDB(tenantID);
  return db.models.Products || db.model("Products", productSchema);
};
export default ProductModel;
