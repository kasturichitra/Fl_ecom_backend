import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

import { imageSchema } from "../lib/imageModel.js";

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

    // Base price (MRP) - original price before tax or discount
    base_price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Gross price = base + tax (price with tax, before discount)
    gross_price: {
      type: Number,
    },

    // Discounted price = base - discount (price after discount, before tax)
    discounted_price: {
      type: Number,
    },

    // Final price = gross - discount (final sellable price)
    final_price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Discount percentage (applied on gross price)
    discount_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Discount amount (calculated from discount_percentage × gross_price)
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

    // GST and tax related info (tax percentages)
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
    // Tax value (calculated on base_price: base × tax_percentage)
    tax_value: {
      type: Number,
      min: 0,
    },

    //  Stock & Inventory
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    min_order_limit: {
      type: Number,
      default: 1,
      min: 1,
    },
    max_order_limit: {
      type: Number,
      min: 1,
    },
    low_stock_threshold: {
      type: Number,
      default: 5,
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
      type: imageSchema,
    },
    product_images: {
      type: [imageSchema],
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

    // Rating Summary - Aggregated from reviews by cron job
    rating_summary: {
      average_rating: {
        type: Number,
        default: 0,
      },
      total_reviews: {
        type: Number,
        default: 0,
      },
      // rating_breakdown: {
      //   1: { type: Number, default: 0 },
      //   2: { type: Number, default: 0 },
      //   3: { type: Number, default: 0 },
      //   4: { type: Number, default: 0 },
      //   5: { type: Number, default: 0 },
      // },
      last_review_aggregated_at: {
        type: Date,
        default: null,
      },
    },
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
