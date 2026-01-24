// import mongoose from "mongoose";
// import { getTenanteDB } from "../Config/tenantDB.js";

// const globalStylesSchema = new mongoose.Schema(
//   {
//     // Colors
//     primaryColor: {
//       type: String,
//       default: "#3B82F6",
//     },
//     secondaryColor: {
//       type: String,
//       default: "#8B5CF6",
//     },
//     backgroundColor: {
//       type: String,
//       default: "#FFFFFF",
//     },
//     textColor: {
//       type: String,
//       default: "#1F2937",
//     },

//     // Typography
//     fontFamily: {
//       type: String,
//       default: "Inter, sans-serif",
//     },

//     // Spacing
//     containerMaxWidth: {
//       type: String,
//       default: "1280px",
//     },
//     borderRadius: {
//       type: String,
//       default: "8px",
//     },
//   },
//   { _id: false },
// );

// const sectionStyleSchema = new mongoose.Schema(
//   {
//     backgroundColor: {
//       type: String,
//       default: "#FFFFFF",
//     },
//     textColor: {
//       type: String,
//       default: "#1F2937",
//     },
//     fontFamily: {
//       type: String,
//       default: "Inter, sans-serif",
//     },
//     fontSize: {
//       type: String,
//       default: "16px",
//     },
//     containerMaxWidth: {
//       type: String,
//       default: "1280px",
//     },
//     borderRadius: {
//       type: String,
//       default: "8px",
//     },
//     padding: {
//       type: String,
//       default: "16px",
//     },
//     margin: {
//       type: String,
//       default: "16px",
//     },
//     maxWidth: {
//       type: String,
//       default: "1280px",
//     },
//     minWidth: {
//       type: String,
//       default: "1280px",
//     },
//     minHeight: {
//       type: String,
//       default: "1280px",
//     },
//     maxHeight: {
//       type: String,
//       default: "1280px",
//     },
//     buttonColor: {
//       type: String,
//       default: "#1F2937",
//     },
//     buttonTextColor: {
//       type: String,
//       default: "#FFFFFF",
//     },
//     buttonHoverColor: {
//       type: String,
//       default: "#1F2937",
//     },
//     buttonHoverTextColor: {
//       type: String,
//       default: "#FFFFFF",
//     },
//   },
//   { _id: false },
// );

// const sectionConfigSchema = new mongoose.Schema(
//   {
//     section_id: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: [
//         "hero",
//         "banner",
//         "category",
//         "product",
//         "testimonial",
//         "brand",
//         "contact",
//         "footer",
//         "about",
//         "blog",
//         "cart",
//         "checkout",
//         "compare",
//         "wishlist",
//         "login",
//         "register",
//         "search",
//         "user",
//         "account",
//         "profile",
//         "notification",
//         "pagination",
//         "sidebar",
//         "header",
//       ],
//       required: true,
//     },
//     order: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     visible: {
//       type: Boolean,
//       default: true,
//     },
//     settings: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {},
//     },
//     styles: {
//       type: sectionStyleSchema,
//       default: {},
//     },
//     is_active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { _id: false },
// );

// const pageConfigSchema = new mongoose.Schema(
//   {
//     sections: [sectionConfigSchema],
//     seo: {
//       title: {
//         type: String,
//         default: "",
//       },
//       description: {
//         type: String,
//         default: "",
//       },
//       keywords: {
//         type: [String],
//         default: [],
//       },
//       ogImage: {
//         type: String,
//         default: "",
//       },
//     },
//   },
//   { _id: false },
// );

// const themeSchema = new mongoose.Schema(
//   {
//     template_name: {
//       type: String,
//       required: true,
//     },
//     template_id: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     status: {
//       type: String,
//       enum: ["draft", "published", "archived"],
//       default: "draft",
//     },
//     is_active: {
//       type: Boolean,
//       default: true,
//     },
//     global_style: {
//       type: globalStylesSchema,
//       default: {},
//     },
//     pages: {
//       home: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       products: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       product: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       cart: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       checkout: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       wishlist: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       profile: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       terms_condition: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       privacy_policy: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       return_policy: {
//         type: pageConfigSchema,
//         default: {},
//       },
//       refund_policy: {
//         type: pageConfigSchema,
//         default: {},
//       },
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// const ThemeModel = async (tenantId) => {
//   const db = await getTenanteDB(tenantId);
//   return db.models.Theme || db.model("Theme", themeSchema);
// };

// export default ThemeModel;


import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

// ============================================================================
// GLOBAL STYLES SCHEMA
// ============================================================================
const globalStylesSchema = new mongoose.Schema(
  {
    // Colors
    primaryColor: {
      type: String,
      default: "#3B82F6",
    },
    secondaryColor: {
      type: String,
      default: "#8B5CF6",
    },
    accentColor: {
      type: String,
      default: "#F59E0B",
    },
    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },
    surfaceColor: {
      type: String,
      default: "#F9FAFB",
    },
    textColor: {
      type: String,
      default: "#1F2937",
    },
    mutedTextColor: {
      type: String,
      default: "#6B7280",
    },
    errorColor: {
      type: String,
      default: "#DC2626",
    },
    successColor: {
      type: String,
      default: "#059669",
    },
    warningColor: {
      type: String,
      default: "#F59E0B",
    },
    infoColor: {
      type: String,
      default: "#3B82F6",
    },

    // Typography
    fontFamily: {
      type: String,
      default: "Inter, sans-serif",
    },
    headingFontFamily: {
      type: String,
      default: "Inter, sans-serif",
    },
    baseFontSize: {
      type: String,
      default: "16px",
    },
    lineHeight: {
      type: String,
      default: "1.6",
    },

    // Layout
    containerMaxWidth: {
      type: String,
      default: "1280px",
    },
    containerPadding: {
      type: String,
      default: "20px",
    },
    sectionSpacing: {
      type: String,
      default: "80px",
    },
    elementSpacing: {
      type: String,
      default: "16px",
    },

    // Border Radius
    borderRadius: {
      type: String,
      default: "8px",
    },
    borderRadiusLg: {
      type: String,
      default: "12px",
    },
    borderRadiusSm: {
      type: String,
      default: "4px",
    },

    // Buttons Configuration
    buttons: {
      primary: {
        variant: {
          type: String,
          enum: ["solid", "outline", "ghost", "gradient"],
          default: "solid",
        },
        size: {
          type: String,
          enum: ["sm", "md", "lg"],
          default: "md",
        },
        backgroundColor: {
          type: String,
          default: "#3B82F6",
        },
        textColor: {
          type: String,
          default: "#FFFFFF",
        },
        borderColor: {
          type: String,
          default: "#3B82F6",
        },
        hoverBackgroundColor: {
          type: String,
          default: "#2563EB",
        },
        hoverTextColor: {
          type: String,
          default: "#FFFFFF",
        },
        fontSize: {
          type: String,
          default: "16px",
        },
        fontWeight: {
          type: String,
          default: "500",
        },
        textTransform: {
          type: String,
          enum: ["none", "uppercase", "lowercase", "capitalize"],
          default: "none",
        },
        letterSpacing: {
          type: String,
          default: "0px",
        },
        padding: {
          type: String,
          default: "12px 24px",
        },
        borderRadius: {
          type: String,
          default: "8px",
        },
        borderWidth: {
          type: String,
          default: "1px",
        },
        boxShadow: {
          type: String,
          default: "none",
        },
        hoverBoxShadow: {
          type: String,
          default: "none",
        },
        transition: {
          type: String,
          default: "all 0.2s ease",
        },
        hoverScale: {
          type: String,
          default: "1",
        },
        // Gradient support
        gradientFrom: {
          type: String,
          default: "",
        },
        gradientTo: {
          type: String,
          default: "",
        },
      },
      secondary: {
        variant: {
          type: String,
          enum: ["solid", "outline", "ghost", "gradient"],
          default: "outline",
        },
        backgroundColor: {
          type: String,
          default: "transparent",
        },
        textColor: {
          type: String,
          default: "#3B82F6",
        },
        borderColor: {
          type: String,
          default: "#3B82F6",
        },
        hoverBackgroundColor: {
          type: String,
          default: "#3B82F6",
        },
        hoverTextColor: {
          type: String,
          default: "#FFFFFF",
        },
        padding: {
          type: String,
          default: "12px 24px",
        },
        borderRadius: {
          type: String,
          default: "8px",
        },
        borderWidth: {
          type: String,
          default: "1px",
        },
      },
    },

    // Cards Configuration
    cards: {
      product: {
        backgroundColor: {
          type: String,
          default: "#FFFFFF",
        },
        borderColor: {
          type: String,
          default: "#E5E7EB",
        },
        borderWidth: {
          type: String,
          default: "1px",
        },
        borderRadius: {
          type: String,
          default: "8px",
        },
        boxShadow: {
          type: String,
          default: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
        hoverBoxShadow: {
          type: String,
          default: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        hoverTransform: {
          type: String,
          default: "translateY(-2px)",
        },
        imageHeight: {
          type: String,
          default: "300px",
        },
        imageObjectFit: {
          type: String,
          enum: ["cover", "contain", "fill"],
          default: "cover",
        },
        contentPadding: {
          type: String,
          default: "16px",
        },
        transition: {
          type: String,
          default: "all 0.3s ease",
        },
      },
      category: {
        backgroundColor: {
          type: String,
          default: "#FFFFFF",
        },
        borderRadius: {
          type: String,
          default: "8px",
        },
        boxShadow: {
          type: String,
          default: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
        hoverBoxShadow: {
          type: String,
          default: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },

    // Header Configuration
    header: {
      backgroundColor: {
        type: String,
        default: "#FFFFFF",
      },
      textColor: {
        type: String,
        default: "#1F2937",
      },
      height: {
        type: String,
        default: "80px",
      },
      sticky: {
        type: Boolean,
        default: true,
      },
      boxShadow: {
        type: String,
        default: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
    },

    // Footer Configuration
    footer: {
      backgroundColor: {
        type: String,
        default: "#1F2937",
      },
      textColor: {
        type: String,
        default: "#FFFFFF",
      },
      padding: {
        type: String,
        default: "60px 20px 40px",
      },
    },
  },
  { _id: false }
);

// ============================================================================
// SECTION STYLE SCHEMA
// ============================================================================
const sectionStyleSchema = new mongoose.Schema(
  {
    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },
    backgroundImage: {
      type: String,
      default: "",
    },
    backgroundSize: {
      type: String,
      enum: ["cover", "contain", "auto"],
      default: "cover",
    },
    backgroundPosition: {
      type: String,
      default: "center",
    },
    textColor: {
      type: String,
      default: "#1F2937",
    },
    fontFamily: {
      type: String,
      default: "Inter, sans-serif",
    },
    fontSize: {
      type: String,
      default: "16px",
    },
    fontWeight: {
      type: String,
      default: "400",
    },
    lineHeight: {
      type: String,
      default: "1.6",
    },
    textAlign: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },
    
    // Layout
    containerMaxWidth: {
      type: String,
      default: "1280px",
    },
    padding: {
      type: String,
      default: "16px",
    },
    margin: {
      type: String,
      default: "0px",
    },
    maxWidth: {
      type: String,
      default: "100%",
    },
    minWidth: {
      type: String,
      default: "0px",
    },
    minHeight: {
      type: String,
      default: "auto",
    },
    maxHeight: {
      type: String,
      default: "none",
    },

    // Border
    borderRadius: {
      type: String,
      default: "8px",
    },
    borderWidth: {
      type: String,
      default: "0px",
    },
    borderColor: {
      type: String,
      default: "#E5E7EB",
    },
    borderStyle: {
      type: String,
      enum: ["solid", "dashed", "dotted", "none"],
      default: "solid",
    },

    // Shadow
    boxShadow: {
      type: String,
      default: "none",
    },

    // Button Styles (section-specific)
    buttonColor: {
      type: String,
      default: "#1F2937",
    },
    buttonTextColor: {
      type: String,
      default: "#FFFFFF",
    },
    buttonHoverColor: {
      type: String,
      default: "#374151",
    },
    buttonHoverTextColor: {
      type: String,
      default: "#FFFFFF",
    },
    buttonBorderRadius: {
      type: String,
      default: "8px",
    },
    buttonPadding: {
      type: String,
      default: "12px 24px",
    },

    // Animation
    transition: {
      type: String,
      default: "all 0.3s ease",
    },
    hoverTransform: {
      type: String,
      default: "none",
    },
  },
  { _id: false }
);

// ============================================================================
// SECTION CONFIG SCHEMA
// ============================================================================
const sectionConfigSchema = new mongoose.Schema(
  {
    section_id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "hero",
        "banner",
        "category",
        "product",
        "testimonial",
        "brand",
        "contact",
        "footer",
        "header",
        "navigation",
        "about",
        "blog",
        "cart",
        "checkout",
        "compare",
        "wishlist",
        "login",
        "register",
        "search",
        "user",
        "account",
        "profile",
        "notification",
        "pagination",
        "sidebar",
        "cta",
        "features",
        "faq",
      ],
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    styles: {
      type: sectionStyleSchema,
      default: {},
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    // Responsive settings
    responsive: {
      mobile: {
        visible: {
          type: Boolean,
          default: true,
        },
        settings: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        styles: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
      tablet: {
        visible: {
          type: Boolean,
          default: true,
        },
        settings: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        styles: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    },
  },
  { _id: false }
);

// ============================================================================
// PAGE CONFIG SCHEMA
// ============================================================================
const pageConfigSchema = new mongoose.Schema(
  {
    sections: [sectionConfigSchema],
    seo: {
      title: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
      keywords: {
        type: [String],
        default: [],
      },
      ogImage: {
        type: String,
        default: "",
      },
      ogTitle: {
        type: String,
        default: "",
      },
      ogDescription: {
        type: String,
        default: "",
      },
      twitterCard: {
        type: String,
        default: "summary_large_image",
      },
      canonicalUrl: {
        type: String,
        default: "",
      },
    },
    layout: {
      type: String,
      enum: ["default", "full-width", "boxed"],
      default: "default",
    },
    customCSS: {
      type: String,
      default: "",
    },
    customJS: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// ============================================================================
// MAIN THEME SCHEMA
// ============================================================================
const themeSchema = new mongoose.Schema(
  {
    template_name: {
      type: String,
      required: true,
    },
    template_id: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    preview_url: {
      type: String,
      default: "",
    },
    
    // Global Styles
    global_style: {
      type: globalStylesSchema,
      default: {},
    },

    // Pages Configuration
    pages: {
      // Main Pages
      home: {
        type: pageConfigSchema,
        default: {},
      },
      products: {
        type: pageConfigSchema,
        default: {},
      },
      product: {
        type: pageConfigSchema,
        default: {},
      },
      cart: {
        type: pageConfigSchema,
        default: {},
      },
      checkout: {
        type: pageConfigSchema,
        default: {},
      },
      wishlist: {
        type: pageConfigSchema,
        default: {},
      },

      // User Pages
      profile: {
        type: pageConfigSchema,
        default: {},
      },
      orders: {
        type: pageConfigSchema,
        default: {},
      },
      order_details: {
        type: pageConfigSchema,
        default: {},
      },

      // Content Pages
      about: {
        type: pageConfigSchema,
        default: {},
      },
      contact: {
        type: pageConfigSchema,
        default: {},
      },
      blog: {
        type: pageConfigSchema,
        default: {},
      },
      blog_post: {
        type: pageConfigSchema,
        default: {},
      },
      faq: {
        type: pageConfigSchema,
        default: {},
      },

      // Policy Pages
      terms_condition: {
        type: pageConfigSchema,
        default: {},
      },
      privacy_policy: {
        type: pageConfigSchema,
        default: {},
      },
      return_policy: {
        type: pageConfigSchema,
        default: {},
      },
      refund_policy: {
        type: pageConfigSchema,
        default: {},
      },
    },

    // Custom Pages (dynamic)
    custom_pages: [
      {
        page_id: {
          type: String,
          required: true,
        },
        page_name: {
          type: String,
          required: true,
        },
        page_slug: {
          type: String,
          required: true,
        },
        page_config: {
          type: pageConfigSchema,
          default: {},
        },
      },
    ],

    // Theme Settings
    settings: {
      enableWishlist: {
        type: Boolean,
        default: true,
      },
      enableCompare: {
        type: Boolean,
        default: true,
      },
      enableQuickView: {
        type: Boolean,
        default: true,
      },
      enableProductReviews: {
        type: Boolean,
        default: true,
      },
      enableBlog: {
        type: Boolean,
        default: true,
      },
      enableNewsletter: {
        type: Boolean,
        default: true,
      },
      enableChatSupport: {
        type: Boolean,
        default: false,
      },
      currencySymbol: {
        type: String,
        default: "$",
      },
      currencyPosition: {
        type: String,
        enum: ["before", "after"],
        default: "before",
      },
      dateFormat: {
        type: String,
        default: "MM/DD/YYYY",
      },
    },

    // Metadata
    metadata: {
      author: {
        type: String,
        default: "",
      },
      tags: {
        type: [String],
        default: [],
      },
      category: {
        type: String,
        enum: ["ecommerce", "fashion", "tech", "food", "beauty", "general"],
        default: "general",
      },
    },

    // Version History
    version_history: [
      {
        version: {
          type: String,
          required: true,
        },
        changes: {
          type: String,
          default: "",
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
themeSchema.index({ template_id: 1 });
themeSchema.index({ status: 1, is_active: 1 });
themeSchema.index({ "metadata.category": 1 });

// Methods
themeSchema.methods.activate = function () {
  this.is_active = true;
  this.status = "published";
  return this.save();
};

themeSchema.methods.deactivate = function () {
  this.is_active = false;
  return this.save();
};

themeSchema.methods.duplicate = function (newTemplateId) {
  const duplicate = this.toObject();
  delete duplicate._id;
  delete duplicate.createdAt;
  delete duplicate.updatedAt;
  duplicate.template_id = newTemplateId;
  duplicate.template_name = `${this.template_name} (Copy)`;
  duplicate.is_active = false;
  duplicate.status = "draft";
  return duplicate;
};

// Static methods
themeSchema.statics.getActiveTheme = async function () {
  return this.findOne({ is_active: true, status: "published" });
};

themeSchema.statics.getAllPublished = async function () {
  return this.find({ status: "published" }).sort({ createdAt: -1 });
};

// Model creation function
const ThemeModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.Theme || db.model("Theme", themeSchema);
};

export default ThemeModel;