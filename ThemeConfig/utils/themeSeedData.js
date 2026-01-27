// export const themeTemplates = [
//   {
//     template_name: "Luxury Premium – Full Seed",
//     template_id: "luxury-premium-full-2026",
//     description: "Complete e-commerce theme with all pages seeded (minimum 5 sections each)",
//     version: "2.0.0",
//     status: "published",
//     is_active: true,
//     thumbnail: "/themes/luxury-premium-full.jpg",

//     global_style: {
//       primaryColor: "#D4AF37",
//       secondaryColor: "#1F2937",
//       accentColor: "#B8860B",
//       backgroundColor: "#FFFFFF",
//       surfaceColor: "#F9FAFB",
//       textColor: "#111827",
//       fontFamily: "Playfair Display, serif",
//       headingFontFamily: "Playfair Display, serif",
//       containerMaxWidth: "1440px",
//       borderRadius: "4px",
//       buttons: {
//         primary: {
//           variant: "solid",
//           backgroundColor: "#D4AF37",
//           textColor: "#1F2937",
//           padding: "18px 48px",
//           borderRadius: "4px",
//           fontWeight: "600",
//           letterSpacing: "1.5px",
//         },
//       },
//     },

//     pages: {
//       // 1. Home
//       home: {
//         sections: [
//           {
//             section_id: "hero-home-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: {
//               title: "Timeless Luxury",
//               subtitle: "Curated for the Discerning",
//               buttonText: "Shop Now",
//               buttonLink: "/products",
//               height: "90vh",
//             },
//             styles: {
//               backgroundType: "image",
//               backgroundImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80",
//               backgroundSize: "cover",
//               textColor: "#ffffff",
//               titleFontSize: "5.5rem",
//             },
//           },
//           {
//             section_id: "featured-collections-1",
//             type: "category",
//             order: 2,
//             visible: true,
//             settings: { title: "Signature Collections", layout: "grid", columns: 4 },
//             styles: { padding: "120px 5%" },
//           },
//           {
//             section_id: "featured-products-1",
//             type: "product",
//             order: 3,
//             visible: true,
//             settings: { title: "Best Sellers", itemsPerRow: 4, showPrice: true },
//             styles: { backgroundColor: "#f8f1e9", padding: "120px 5%" },
//           },
//           {
//             section_id: "testimonial-1",
//             type: "testimonial",
//             order: 4,
//             visible: true,
//             settings: { title: "Our Clients Say", layout: "carousel", showRating: true },
//             styles: { padding: "120px 5%" },
//           },
//           {
//             section_id: "newsletter-1",
//             type: "newsletter",
//             order: 5,
//             visible: true,
//             settings: { title: "Join the Exclusive List", subtitle: "Receive private invitations" },
//             styles: { backgroundColor: "#1f2937", textColor: "#ffffff", padding: "100px 5%" },
//           },
//         ],
//       },

//       // 2. Products (Collection page)
//       products: {
//         sections: [
//           {
//             section_id: "products-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "All Collections", height: "50vh" },
//             styles: {
//               backgroundType: "image",
//               backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80",
//               backgroundSize: "cover",
//             },
//           },
//           {
//             section_id: "products-filters-1",
//             type: "product",
//             order: 2,
//             visible: true,
//             settings: { showFilters: true, showSort: true, layout: "grid", itemsPerRow: 4 },
//           },
//           {
//             section_id: "products-grid-1",
//             type: "product",
//             order: 3,
//             visible: true,
//             settings: { title: "Our Products", itemsPerRow: 4, showPrice: true, showQuickView: true },
//           },
//           {
//             section_id: "products-banner-1",
//             type: "banner",
//             order: 4,
//             visible: true,
//             settings: { title: "New Arrivals – 20% Off", buttonText: "Shop Now" },
//           },
//           {
//             section_id: "products-pagination-1",
//             type: "pagination",
//             order: 5,
//             visible: true,
//             settings: { style: "numbers", showPrevNext: true },
//           },
//         ],
//       },

//       // 3. Single Product
//       product: {
//         sections: [
//           {
//             section_id: "product-main-1",
//             type: "product",
//             order: 1,
//             visible: true,
//             settings: { layout: "gallery-left", showReviews: true, showRelated: true, showSizeGuide: true },
//           },
//           {
//             section_id: "product-description-1",
//             type: "product",
//             order: 2,
//             visible: true,
//             settings: { showTabs: true, tabs: ["Description", "Details", "Shipping", "Reviews"] },
//           },
//           {
//             section_id: "product-related-1",
//             type: "product",
//             order: 3,
//             visible: true,
//             settings: { title: "You May Also Like", itemsPerRow: 4 },
//           },
//           {
//             section_id: "product-recently-viewed-1",
//             type: "product",
//             order: 4,
//             visible: true,
//             settings: { title: "Recently Viewed", itemsPerRow: 4 },
//           },
//           {
//             section_id: "product-upsell-1",
//             type: "product",
//             order: 5,
//             visible: true,
//             settings: { title: "Frequently Bought Together", itemsPerRow: 3 },
//           },
//         ],
//       },

//       // 4. Cart
//       cart: {
//         sections: [
//           {
//             section_id: "cart-header-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Your Cart", height: "300px" },
//           },
//           {
//             section_id: "cart-items-1",
//             type: "cart",
//             order: 2,
//             visible: true,
//             settings: { showCoupon: true, showSaveLater: true, layout: "list" },
//           },
//           {
//             section_id: "cart-summary-1",
//             type: "cart",
//             order: 3,
//             visible: true,
//             settings: { showSummary: true, showShipping: true },
//           },
//           {
//             section_id: "cart-recommendations-1",
//             type: "product",
//             order: 4,
//             visible: true,
//             settings: { title: "You May Also Like", itemsPerRow: 4 },
//           },
//           {
//             section_id: "cart-cta-1",
//             type: "cta",
//             order: 5,
//             visible: true,
//             settings: { title: "Ready to Checkout?", buttonText: "Proceed to Checkout" },
//           },
//         ],
//       },

//       // 5. Checkout
//       checkout: {
//         sections: [
//           {
//             section_id: "checkout-progress-1",
//             type: "checkout",
//             order: 1,
//             visible: true,
//             settings: { showProgressBar: true, steps: ["Shipping", "Payment", "Review"] },
//           },
//           {
//             section_id: "checkout-form-1",
//             type: "checkout",
//             order: 2,
//             visible: true,
//             settings: { showShippingForm: true, showBillingForm: true, allowGuestCheckout: true },
//           },
//           {
//             section_id: "checkout-summary-1",
//             type: "checkout",
//             order: 3,
//             visible: true,
//             settings: { showOrderSummary: true, showSecurityBadge: true },
//           },
//           {
//             section_id: "checkout-upsell-1",
//             type: "product",
//             order: 4,
//             visible: true,
//             settings: { title: "Add Gift Wrapping", itemsPerRow: 2 },
//           },
//           {
//             section_id: "checkout-cta-1",
//             type: "cta",
//             order: 5,
//             visible: true,
//             settings: { title: "Complete Your Order", buttonText: "Place Order" },
//           },
//         ],
//       },

//       // 6. Wishlist
//       wishlist: {
//         sections: [
//           {
//             section_id: "wishlist-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "My Wishlist", subtitle: "Your favorite items saved for later" },
//           },
//           {
//             section_id: "wishlist-items-1",
//             type: "wishlist",
//             order: 2,
//             visible: true,
//             settings: { showMoveToCart: true, showRemove: true, itemsPerRow: 4 },
//           },
//           {
//             section_id: "wishlist-recommendations-1",
//             type: "product",
//             order: 3,
//             visible: true,
//             settings: { title: "You Might Like", itemsPerRow: 4 },
//           },
//           {
//             section_id: "wishlist-cta-1",
//             type: "cta",
//             order: 4,
//             visible: true,
//             settings: { title: "Start Shopping", buttonText: "Browse Products" },
//           },
//           {
//             section_id: "wishlist-empty-1",
//             type: "hero",
//             order: 5,
//             visible: true,
//             settings: { title: "Your Wishlist is Empty", subtitle: "Add items you love" },
//           },
//         ],
//       },

//       // 7. Profile / Account
//       profile: {
//         sections: [
//           {
//             section_id: "profile-hero-1",
//             type: "account",
//             order: 1,
//             visible: true,
//             settings: { showAvatar: true, showUserInfo: true, layout: "banner" },
//           },
//           {
//             section_id: "profile-tabs-1",
//             type: "account",
//             order: 2,
//             visible: true,
//             settings: { showTabs: true, tabs: ["Profile", "Orders", "Addresses", "Wishlist"] },
//           },
//           {
//             section_id: "profile-content-1",
//             type: "profile",
//             order: 3,
//             visible: true,
//             settings: { showPersonalInfo: true, showAddresses: true, allowEdit: true },
//           },
//           {
//             section_id: "profile-recent-orders-1",
//             type: "account",
//             order: 4,
//             visible: true,
//             settings: { showRecentOrders: true, limit: 5 },
//           },
//           {
//             section_id: "profile-cta-1",
//             type: "cta",
//             order: 5,
//             visible: true,
//             settings: { title: "Need Help?", buttonText: "Contact Support" },
//           },
//         ],
//       },

//       // 8. Orders
//       orders: {
//         sections: [
//           {
//             section_id: "orders-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Order History", subtitle: "Track and manage your purchases" },
//           },
//           {
//             section_id: "orders-filters-1",
//             type: "account",
//             order: 2,
//             visible: true,
//             settings: { showFilters: true, showSearch: true },
//           },
//           {
//             section_id: "orders-list-1",
//             type: "account",
//             order: 3,
//             visible: true,
//             settings: { layout: "list", showStatus: true, showTracking: true },
//           },
//           { section_id: "orders-pagination-1", type: "pagination", order: 4, visible: true },
//           {
//             section_id: "orders-cta-1",
//             type: "cta",
//             order: 5,
//             visible: true,
//             settings: { title: "Continue Shopping", buttonText: "Shop Now" },
//           },
//         ],
//       },

//       // 9. Order Details
//       order_details: {
//         sections: [
//           {
//             section_id: "order-details-header-1",
//             type: "account",
//             order: 1,
//             visible: true,
//             settings: { showOrderNumber: true, showStatus: true },
//           },
//           {
//             section_id: "order-details-timeline-1",
//             type: "account",
//             order: 2,
//             visible: true,
//             settings: { showTimeline: true, showTracking: true },
//           },
//           {
//             section_id: "order-details-items-1",
//             type: "account",
//             order: 3,
//             visible: true,
//             settings: { showItems: true, showPricing: true },
//           },
//           {
//             section_id: "order-details-shipping-1",
//             type: "account",
//             order: 4,
//             visible: true,
//             settings: { showShippingAddress: true, showPaymentMethod: true },
//           },
//           {
//             section_id: "order-details-actions-1",
//             type: "account",
//             order: 5,
//             visible: true,
//             settings: { showInvoice: true, allowCancellation: true },
//           },
//         ],
//       },

//       // 10. About Us
//       about: {
//         sections: [
//           {
//             section_id: "about-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Our Story", height: "600px" },
//             styles: {
//               backgroundType: "image",
//               backgroundImage: "https://images.unsplash.com/photo-1521737711867-e3b827c2982f?auto=format&fit=crop&q=80",
//             },
//           },
//           {
//             section_id: "about-story-1",
//             type: "about",
//             order: 2,
//             visible: true,
//             settings: { title: "Heritage & Craft", content: "<p>Founded in 1998...</p>", imagePosition: "right" },
//           },
//           {
//             section_id: "about-mission-1",
//             type: "about",
//             order: 3,
//             visible: true,
//             settings: { title: "Our Mission", content: "<p>To deliver timeless luxury...</p>", imagePosition: "left" },
//           },
//           {
//             section_id: "about-values-1",
//             type: "about",
//             order: 4,
//             visible: true,
//             settings: { title: "Our Values", layout: "grid", columns: 3 },
//           },
//           {
//             section_id: "about-team-1",
//             type: "about",
//             order: 5,
//             visible: true,
//             settings: { title: "Meet the Team", layout: "grid", columns: 4 },
//           },
//         ],
//       },

//       // 11. Contact
//       contact: {
//         sections: [
//           {
//             section_id: "contact-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Get in Touch", subtitle: "We’d love to hear from you" },
//           },
//           {
//             section_id: "contact-info-1",
//             type: "contact",
//             order: 2,
//             visible: true,
//             settings: { showAddress: true, showPhone: true, showEmail: true, layout: "grid" },
//           },
//           {
//             section_id: "contact-form-1",
//             type: "contact",
//             order: 3,
//             visible: true,
//             settings: { showForm: true, formFields: ["name", "email", "message"] },
//           },
//           {
//             section_id: "contact-map-1",
//             type: "contact",
//             order: 4,
//             visible: true,
//             settings: { showMap: true, mapHeight: "500px" },
//           },
//           {
//             section_id: "contact-cta-1",
//             type: "cta",
//             order: 5,
//             visible: true,
//             settings: { title: "Need Immediate Help?", buttonText: "Call Us Now" },
//           },
//         ],
//       },

//       // 12. Blog
//       blog: {
//         sections: [
//           {
//             section_id: "blog-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Our Journal", subtitle: "Stories, Inspiration & Insights" },
//           },
//           {
//             section_id: "blog-featured-1",
//             type: "blog",
//             order: 2,
//             visible: true,
//             settings: { title: "Featured Posts", layout: "carousel", maxItems: 3 },
//           },
//           {
//             section_id: "blog-filters-1",
//             type: "blog",
//             order: 3,
//             visible: true,
//             settings: { showCategories: true, showSearch: true },
//           },
//           {
//             section_id: "blog-list-1",
//             type: "blog",
//             order: 4,
//             visible: true,
//             settings: { layout: "grid", itemsPerRow: 3, showExcerpt: true },
//           },
//           { section_id: "blog-pagination-1", type: "pagination", order: 5, visible: true },
//         ],
//       },

//       // 13. Blog Post
//       blog_post: {
//         sections: [
//           {
//             section_id: "blog-post-header-1",
//             type: "blog",
//             order: 1,
//             visible: true,
//             settings: { showFeaturedImage: true, showTitle: true, showMeta: true },
//           },
//           {
//             section_id: "blog-post-content-1",
//             type: "blog",
//             order: 2,
//             visible: true,
//             settings: { showContent: true, showTableOfContents: true },
//           },
//           {
//             section_id: "blog-post-share-1",
//             type: "blog",
//             order: 3,
//             visible: true,
//             settings: { showShare: true, shareButtons: ["facebook", "twitter", "linkedin"] },
//           },
//           {
//             section_id: "blog-post-author-1",
//             type: "blog",
//             order: 4,
//             visible: true,
//             settings: { showAuthorBio: true },
//           },
//           {
//             section_id: "blog-post-related-1",
//             type: "blog",
//             order: 5,
//             visible: true,
//             settings: { showRelated: true, maxRelated: 3 },
//           },
//         ],
//       },

//       // 14. FAQ
//       faq: {
//         sections: [
//           {
//             section_id: "faq-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Frequently Asked Questions", subtitle: "Find answers quickly" },
//           },
//           {
//             section_id: "faq-search-1",
//             type: "search",
//             order: 2,
//             visible: true,
//             settings: { showSearch: true, placeholder: "Search FAQs..." },
//           },
//           {
//             section_id: "faq-categories-1",
//             type: "category",
//             order: 3,
//             visible: true,
//             settings: { layout: "tabs", categories: ["General", "Orders", "Shipping", "Returns"] },
//           },
//           {
//             section_id: "faq-list-1",
//             type: "faq",
//             order: 4,
//             visible: true,
//             settings: { layout: "accordion", allowMultipleOpen: false },
//           },
//           {
//             section_id: "faq-contact-1",
//             type: "cta",
//             order: 5,
//             visible: true,
//             settings: { title: "Still have questions?", buttonText: "Contact Support" },
//           },
//         ],
//       },

//       // 15. Terms & Conditions
//       terms_condition: {
//         sections: [
//           {
//             section_id: "terms-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Terms & Conditions", subtitle: "Last updated January 2026" },
//           },
//           {
//             section_id: "terms-toc-1",
//             type: "about",
//             order: 2,
//             visible: true,
//             settings: { showTableOfContents: true },
//           },
//           {
//             section_id: "terms-content-1",
//             type: "about",
//             order: 3,
//             visible: true,
//             settings: { showContent: true, contentMaxWidth: "800px" },
//           },
//           {
//             section_id: "terms-contact-1",
//             type: "contact",
//             order: 4,
//             visible: true,
//             settings: { title: "Questions?", buttonText: "Contact Us" },
//           },
//           { section_id: "terms-footer-1", type: "footer", order: 5, visible: true, settings: { showSocial: true } },
//         ],
//       },

//       // 16. Privacy Policy
//       privacy_policy: {
//         sections: [
//           {
//             section_id: "privacy-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Privacy Policy", subtitle: "Your data is safe with us" },
//           },
//           {
//             section_id: "privacy-toc-1",
//             type: "about",
//             order: 2,
//             visible: true,
//             settings: { showTableOfContents: true },
//           },
//           { section_id: "privacy-content-1", type: "about", order: 3, visible: true, settings: { showContent: true } },
//           {
//             section_id: "privacy-contact-1",
//             type: "contact",
//             order: 4,
//             visible: true,
//             settings: { title: "Questions about privacy?", buttonText: "Contact Us" },
//           },
//           { section_id: "privacy-footer-1", type: "footer", order: 5, visible: true },
//         ],
//       },

//       // 17. Return Policy
//       return_policy: {
//         sections: [
//           {
//             section_id: "return-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Return Policy", subtitle: "Hassle-free returns within 30 days" },
//           },
//           {
//             section_id: "return-toc-1",
//             type: "about",
//             order: 2,
//             visible: true,
//             settings: { showTableOfContents: true },
//           },
//           { section_id: "return-content-1", type: "about", order: 3, visible: true, settings: { showContent: true } },
//           {
//             section_id: "return-contact-1",
//             type: "contact",
//             order: 4,
//             visible: true,
//             settings: { title: "Need help with a return?", buttonText: "Contact Support" },
//           },
//           { section_id: "return-footer-1", type: "footer", order: 5, visible: true },
//         ],
//       },

//       // 18. Refund Policy
//       refund_policy: {
//         sections: [
//           {
//             section_id: "refund-hero-1",
//             type: "hero",
//             order: 1,
//             visible: true,
//             settings: { title: "Refund Policy", subtitle: "Clear and transparent refunds" },
//           },
//           {
//             section_id: "refund-toc-1",
//             type: "about",
//             order: 2,
//             visible: true,
//             settings: { showTableOfContents: true },
//           },
//           { section_id: "refund-content-1", type: "about", order: 3, visible: true, settings: { showContent: true } },
//           {
//             section_id: "refund-contact-1",
//             type: "contact",
//             order: 4,
//             visible: true,
//             settings: { title: "Questions about refunds?", buttonText: "Contact Us" },
//           },
//           { section_id: "refund-footer-1", type: "footer", order: 5, visible: true },
//         ],
//       },
//     },

//     // Settings, metadata, etc. remain same
//     settings: {
//       enableWishlist: true,
//       enableCompare: true,
//       enableQuickView: true,
//       enableProductReviews: true,
//       enableBlog: true,
//       enableNewsletter: true,
//     },
//   },
// ];


// Seed data for E-commerce Theme
export const themeTemplates = [
  {
    template_name: "Modern E-Commerce Store",
    template_id: "modern-ecommerce-v1",
    theme_amount: 99,
    theme_currency: "USD",
    theme_image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc",
    description: "A modern, fully-featured e-commerce theme with clean design and powerful customization options",
    version: "1.0.0",
    status: "published",
    is_active: true,
    thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc",
    preview_url: "https://preview.modernstore.com",

    // ============================================================================
    // GLOBAL STYLES
    // ============================================================================
    global_style: {
      // Colors
      primaryColor: "#2563EB",
      secondaryColor: "#7C3AED",
      accentColor: "#F59E0B",
      backgroundColor: "#FFFFFF",
      surfaceColor: "#F9FAFB",
      textColor: "#1F2937",
      mutedTextColor: "#6B7280",
      errorColor: "#DC2626",
      successColor: "#059669",
      warningColor: "#F59E0B",
      infoColor: "#3B82F6",

      // Typography
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      headingFontFamily: "'Poppins', 'Inter', sans-serif",
      baseFontSize: "16px",
      lineHeight: "1.6",

      // Layout
      containerMaxWidth: "1280px",
      containerPadding: "20px",
      sectionSpacing: "80px",
      elementSpacing: "16px",

      // Border Radius
      borderRadius: "8px",
      borderRadiusLg: "12px",
      borderRadiusSm: "4px",

      // Buttons Configuration
      buttons: {
        primary: {
          variant: "solid",
          size: "md",
          backgroundColor: "#2563EB",
          textColor: "#FFFFFF",
          borderColor: "#2563EB",
          hoverBackgroundColor: "#1D4ED8",
          hoverTextColor: "#FFFFFF",
          fontSize: "16px",
          fontWeight: "600",
          textTransform: "none",
          letterSpacing: "0px",
          padding: "14px 32px",
          borderRadius: "8px",
          borderWidth: "2px",
          boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)",
          hoverBoxShadow: "0 6px 12px rgba(37, 99, 235, 0.3)",
          transition: "all 0.3s ease",
          hoverScale: "1.02",
          gradientFrom: "",
          gradientTo: "",
        },
        secondary: {
          variant: "outline",
          backgroundColor: "transparent",
          textColor: "#2563EB",
          borderColor: "#2563EB",
          hoverBackgroundColor: "#2563EB",
          hoverTextColor: "#FFFFFF",
          padding: "14px 32px",
          borderRadius: "8px",
          borderWidth: "2px",
        },
      },

      // Cards Configuration
      cards: {
        product: {
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
          borderWidth: "1px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          hoverBoxShadow: "0 8px 16px rgba(0, 0, 0, 0.12)",
          hoverTransform: "translateY(-4px)",
          imageHeight: "320px",
          imageObjectFit: "cover",
          contentPadding: "20px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        category: {
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          hoverBoxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
        },
      },

      // Header Configuration
      header: {
        backgroundColor: "#FFFFFF",
        textColor: "#1F2937",
        height: "80px",
        sticky: true,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      },

      // Footer Configuration
      footer: {
        backgroundColor: "#1F2937",
        textColor: "#F9FAFB",
        padding: "60px 20px 40px",
      },
    },

    // ============================================================================
    // PAGES CONFIGURATION
    // ============================================================================
    pages: {
      // ========================================
      // HOME PAGE
      // ========================================
      home: {
        sections: [
          // Section 1: Hero Banner
          {
            section_id: "home-hero-1",
            type: "hero",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
            order: 1,
            visible: true,
            is_active: true,
            settings: {
              title: "Summer Collection 2024",
              subtitle: "Discover the latest trends",
              description: "Elevate your style with our curated collection of premium fashion pieces",
              primaryButtonText: "Shop Now",
              primaryButtonLink: "/products",
              secondaryButtonText: "View Lookbook",
              secondaryButtonLink: "/lookbook",
              overlay: true,
              overlayOpacity: 0.4,
              textPosition: "left",
              minHeight: "600px",
            },
            styles: {
              backgroundColor: "#1F2937",
              backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
              backgroundSize: "cover",
              backgroundPosition: "center",
              textColor: "#FFFFFF",
              padding: "100px 20px",
              minHeight: "600px",
              textAlign: "left",
              buttonColor: "#2563EB",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#1D4ED8",
              buttonPadding: "16px 40px",
              borderRadius: "0px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  minHeight: "400px",
                },
                styles: {
                  padding: "60px 20px",
                  textAlign: "center",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  minHeight: "500px",
                },
                styles: {
                  padding: "80px 20px",
                },
              },
            },
          },

          // Section 2: Featured Categories
          {
            section_id: "home-categories-2",
            type: "category",
            order: 2,
            visible: true,
            is_active: true,
            settings: {
              title: "Shop by Category",
              subtitle: "Explore our collections",
              layout: "grid",
              columns: 4,
              showTitle: true,
              showDescription: true,
              categories: [
                {
                  id: "cat-1",
                  name: "Women's Fashion",
                  image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
                  link: "/category/women",
                  description: "Latest trends for her",
                },
                {
                  id: "cat-2",
                  name: "Men's Fashion",
                  image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891",
                  link: "/category/men",
                  description: "Style essentials for him",
                },
                {
                  id: "cat-3",
                  name: "Accessories",
                  image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f",
                  link: "/category/accessories",
                  description: "Complete your look",
                },
                {
                  id: "cat-4",
                  name: "Footwear",
                  image: "https://images.unsplash.com/photo-1549298916-b41d501d3772",
                  link: "/category/footwear",
                  description: "Step in style",
                },
              ],
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "80px 20px",
              containerMaxWidth: "1280px",
              borderRadius: "0px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                },
                styles: {
                  padding: "40px 20px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 2,
                },
                styles: {
                  padding: "60px 20px",
                },
              },
            },
          },

          // Section 3: Featured Products
          {
            section_id: "home-products-3",
            type: "product",
            order: 3,
            visible: true,
            is_active: true,
            settings: {
              title: "Trending Now",
              subtitle: "Don't miss out on these popular items",
              layout: "grid",
              columns: 4,
              productsPerPage: 8,
              showQuickView: true,
              showAddToCart: true,
              showWishlist: true,
              showCompare: true,
              showRating: true,
              showBadges: true,
              productSource: "featured",
              sortBy: "popularity",
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "80px 20px",
              containerMaxWidth: "1280px",
              buttonColor: "#2563EB",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#1D4ED8",
              borderRadius: "12px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                  productsPerPage: 4,
                },
                styles: {
                  padding: "40px 20px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 2,
                  productsPerPage: 6,
                },
                styles: {
                  padding: "60px 20px",
                },
              },
            },
          },

          // Section 4: Promotional Banner
          {
            section_id: "home-banner-4",
            type: "banner",
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da",
            order: 4,
            visible: true,
            is_active: true,
            settings: {
              title: "Mid-Season Sale",
              subtitle: "Up to 50% Off",
              description: "Limited time offer on selected items",
              buttonText: "Shop Sale",
              buttonLink: "/sale",
              layout: "full-width",
              contentPosition: "center",
              overlay: true,
              overlayOpacity: 0.5,
            },
            styles: {
              backgroundColor: "#7C3AED",
              backgroundImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da",
              backgroundSize: "cover",
              backgroundPosition: "center",
              textColor: "#FFFFFF",
              padding: "100px 20px",
              minHeight: "400px",
              textAlign: "center",
              buttonColor: "#F59E0B",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#D97706",
              buttonPadding: "16px 48px",
              borderRadius: "0px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  contentPosition: "center",
                },
                styles: {
                  padding: "60px 20px",
                  minHeight: "300px",
                },
              },
              tablet: {
                visible: true,
                styles: {
                  padding: "80px 20px",
                  minHeight: "350px",
                },
              },
            },
          },

          // Section 5: Brands
          {
            section_id: "home-brands-5",
            type: "brand",
            order: 5,
            visible: true,
            is_active: true,
            settings: {
              title: "Our Partners",
              subtitle: "Trusted brands we work with",
              layout: "carousel",
              autoplay: true,
              autoplaySpeed: 3000,
              showDots: false,
              showArrows: true,
              brands: [
                {
                  id: "brand-1",
                  name: "Nike",
                  logo: "https://via.placeholder.com/200x100?text=Nike",
                  link: "/brands/nike",
                },
                {
                  id: "brand-2",
                  name: "Adidas",
                  logo: "https://via.placeholder.com/200x100?text=Adidas",
                  link: "/brands/adidas",
                },
                {
                  id: "brand-3",
                  name: "Puma",
                  logo: "https://via.placeholder.com/200x100?text=Puma",
                  link: "/brands/puma",
                },
                {
                  id: "brand-4",
                  name: "Zara",
                  logo: "https://via.placeholder.com/200x100?text=Zara",
                  link: "/brands/zara",
                },
                {
                  id: "brand-5",
                  name: "H&M",
                  logo: "https://via.placeholder.com/200x100?text=H&M",
                  link: "/brands/hm",
                },
              ],
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "60px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                styles: {
                  padding: "40px 20px",
                },
              },
              tablet: {
                visible: true,
                styles: {
                  padding: "50px 20px",
                },
              },
            },
          },
        ],
        seo: {
          title: "Modern E-Commerce Store - Shop Latest Fashion Trends",
          description:
            "Discover premium fashion items, trending styles, and exclusive deals. Shop women's fashion, men's fashion, accessories, and footwear.",
          keywords: ["ecommerce", "fashion", "online shopping", "clothing", "accessories"],
          ogImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
          ogTitle: "Modern E-Commerce Store - Your Fashion Destination",
          ogDescription: "Shop the latest trends in fashion and accessories",
          twitterCard: "summary_large_image",
          canonicalUrl: "https://modernstore.com",
        },
        layout: "default",
        is_active: true,
      },

      // ========================================
      // PRODUCTS PAGE
      // ========================================
      products: {
        sections: [
          // Section 1: Page Header
          {
            section_id: "products-header-1",
            type: "header",
            order: 1,
            visible: true,
            is_active: true,
            settings: {
              title: "All Products",
              subtitle: "Browse our complete collection",
              breadcrumb: true,
              showSearch: true,
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "40px 20px",
              textAlign: "center",
              borderRadius: "0px",
            },
            responsive: {
              mobile: {
                visible: true,
                styles: {
                  padding: "30px 20px",
                },
              },
              tablet: {
                visible: true,
                styles: {
                  padding: "35px 20px",
                },
              },
            },
          },

          // Section 2: Filters Sidebar
          {
            section_id: "products-sidebar-2",
            type: "sidebar",
            order: 2,
            visible: true,
            is_active: true,
            settings: {
              position: "left",
              sticky: true,
              collapsible: true,
              filters: {
                categories: true,
                priceRange: true,
                colors: true,
                sizes: true,
                brands: true,
                rating: true,
                availability: true,
              },
              showFilterCount: true,
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  position: "top",
                  collapsible: true,
                },
                styles: {
                  padding: "15px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  position: "left",
                },
              },
            },
          },

          // Section 3: Products Grid
          {
            section_id: "products-grid-3",
            type: "product",
            order: 3,
            visible: true,
            is_active: true,
            settings: {
              layout: "grid",
              columns: 3,
              productsPerPage: 12,
              showQuickView: true,
              showAddToCart: true,
              showWishlist: true,
              showCompare: true,
              showRating: true,
              showBadges: true,
              sortOptions: ["popularity", "price-low-high", "price-high-low", "newest", "rating"],
              viewOptions: ["grid", "list"],
              defaultView: "grid",
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "40px 20px",
              containerMaxWidth: "1280px",
              buttonColor: "#2563EB",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#1D4ED8",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                  productsPerPage: 6,
                },
                styles: {
                  padding: "20px 15px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 2,
                  productsPerPage: 9,
                },
                styles: {
                  padding: "30px 20px",
                },
              },
            },
          },

          // Section 4: Pagination
          {
            section_id: "products-pagination-4",
            type: "pagination",
            order: 4,
            visible: true,
            is_active: true,
            settings: {
              type: "numbers",
              showPrevNext: true,
              showFirstLast: true,
              maxPages: 7,
              position: "center",
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "40px 20px",
              buttonColor: "#2563EB",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#1D4ED8",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  maxPages: 3,
                },
              },
              tablet: {
                visible: true,
                settings: {
                  maxPages: 5,
                },
              },
            },
          },

          // Section 5: Recently Viewed
          {
            section_id: "products-recent-5",
            type: "product",
            order: 5,
            visible: true,
            is_active: true,
            settings: {
              title: "Recently Viewed",
              subtitle: "Products you've checked out",
              layout: "carousel",
              columns: 5,
              productsPerPage: 10,
              showQuickView: false,
              showAddToCart: true,
              productSource: "recently-viewed",
              autoplay: true,
              autoplaySpeed: 4000,
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "60px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                },
                styles: {
                  padding: "40px 15px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 3,
                },
              },
            },
          },
        ],
        seo: {
          title: "Shop All Products - Modern E-Commerce Store",
          description:
            "Browse our complete collection of fashion items. Find the perfect style for you with our wide range of products.",
          keywords: ["products", "shop", "fashion", "clothing", "online store"],
          ogImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
          ogTitle: "All Products - Modern Store",
          ogDescription: "Explore our full catalog of fashion products",
        },
        layout: "default",
        is_active: true,
      },

      // ========================================
      // PRODUCT DETAIL PAGE
      // ========================================
      product: {
        sections: [
          // Section 1: Breadcrumb
          {
            section_id: "product-breadcrumb-1",
            type: "navigation",
            order: 1,
            visible: true,
            is_active: true,
            settings: {
              showBreadcrumb: true,
              separator: ">",
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#6B7280",
              padding: "20px 20px",
              fontSize: "14px",
            },
          },

          // Section 2: Product Gallery & Info
          {
            section_id: "product-main-2",
            type: "product",
            order: 2,
            visible: true,
            is_active: true,
            settings: {
              layout: "two-column",
              galleryPosition: "left",
              galleryType: "thumbnails",
              zoomEnabled: true,
              showThumbnails: true,
              thumbnailPosition: "bottom",
              showSKU: true,
              showAvailability: true,
              showBrand: true,
              showRating: true,
              showReviewCount: true,
              showShareButtons: true,
              showWishlist: true,
              showCompare: true,
              quantitySelector: true,
              variantSelector: "dropdown",
              showSizeChart: true,
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "40px 20px",
              containerMaxWidth: "1280px",
              buttonColor: "#2563EB",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#1D4ED8",
              buttonPadding: "16px 40px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  layout: "single-column",
                  thumbnailPosition: "bottom",
                },
                styles: {
                  padding: "20px 15px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  layout: "two-column",
                },
              },
            },
          },

          // Section 3: Product Tabs (Description, Reviews, etc.)
          {
            section_id: "product-tabs-3",
            type: "product",
            order: 3,
            visible: true,
            is_active: true,
            settings: {
              layout: "tabs",
              tabs: [
                {
                  id: "description",
                  title: "Description",
                  enabled: true,
                },
                {
                  id: "specifications",
                  title: "Specifications",
                  enabled: true,
                },
                {
                  id: "reviews",
                  title: "Reviews",
                  enabled: true,
                },
                {
                  id: "shipping",
                  title: "Shipping & Returns",
                  enabled: true,
                },
              ],
              defaultTab: "description",
              reviewsEnabled: true,
              reviewForm: true,
              reviewRating: true,
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "60px 20px",
              containerMaxWidth: "1280px",
              borderRadius: "0px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  layout: "accordion",
                },
                styles: {
                  padding: "40px 15px",
                },
              },
              tablet: {
                visible: true,
              },
            },
          },

          // Section 4: Related Products
          {
            section_id: "product-related-4",
            type: "product",
            order: 4,
            visible: true,
            is_active: true,
            settings: {
              title: "You May Also Like",
              subtitle: "Similar products to consider",
              layout: "carousel",
              columns: 4,
              productsPerPage: 8,
              showQuickView: true,
              showAddToCart: true,
              productSource: "related",
              autoplay: true,
              autoplaySpeed: 5000,
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "80px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                },
                styles: {
                  padding: "40px 15px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 2,
                },
              },
            },
          },

          // Section 5: Recently Viewed
          {
            section_id: "product-recent-5",
            type: "product",
            order: 5,
            visible: true,
            is_active: true,
            settings: {
              title: "Recently Viewed Products",
              layout: "carousel",
              columns: 5,
              productsPerPage: 10,
              productSource: "recently-viewed",
              showQuickView: false,
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "60px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 3,
                },
              },
            },
          },
        ],
        seo: {
          title: "Product Name - Modern E-Commerce Store",
          description: "Detailed product information, specifications, and reviews",
          keywords: ["product", "buy", "shop", "online"],
          ogImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        },
        layout: "default",
        is_active: true,
      },

      // ========================================
      // CART PAGE
      // ========================================
      cart: {
        sections: [
          // Section 1: Page Header
          {
            section_id: "cart-header-1",
            type: "header",
            order: 1,
            visible: true,
            is_active: true,
            settings: {
              title: "Shopping Cart",
              subtitle: "Review your items before checkout",
              breadcrumb: true,
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "40px 20px",
              textAlign: "center",
            },
          },

          // Section 2: Cart Items
          {
            section_id: "cart-items-2",
            type: "cart",
            order: 2,
            visible: true,
            is_active: true,
            settings: {
              layout: "table",
              showProductImage: true,
              showProductName: true,
              showProductPrice: true,
              showQuantitySelector: true,
              showRemoveButton: true,
              showSubtotal: true,
              showSaveForLater: true,
              showCouponCode: true,
              showEstimatedShipping: true,
              continueShoppingLink: "/products",
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "40px 20px",
              containerMaxWidth: "1280px",
              buttonColor: "#2563EB",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#1D4ED8",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  layout: "list",
                },
                styles: {
                  padding: "20px 15px",
                },
              },
              tablet: {
                visible: true,
              },
            },
          },

          // Section 3: Cart Summary
          {
            section_id: "cart-summary-3",
            type: "cart",
            order: 3,
            visible: true,
            is_active: true,
            settings: {
              position: "right",
              sticky: true,
              showSubtotal: true,
              showTax: true,
              showShipping: true,
              showTotal: true,
              showCheckoutButton: true,
              showSecureCheckoutBadge: true,
              acceptedPayments: ["visa", "mastercard", "amex", "paypal"],
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              buttonColor: "#059669",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#047857",
              buttonPadding: "16px 40px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  sticky: false,
                },
              },
              tablet: {
                visible: true,
              },
            },
          },

          // Section 4: Cross-sell Products
          {
            section_id: "cart-crosssell-4",
            type: "product",
            order: 4,
            visible: true,
            is_active: true,
            settings: {
              title: "Frequently Bought Together",
              subtitle: "Complete your purchase",
              layout: "carousel",
              columns: 4,
              productsPerPage: 6,
              productSource: "cross-sell",
              showQuickView: false,
              showAddToCart: true,
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "60px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 2,
                },
              },
            },
          },

          // Section 5: Trust Badges
          {
            section_id: "cart-trust-5",
            type: "features",
            order: 5,
            visible: true,
            is_active: true,
            settings: {
              layout: "horizontal",
              features: [
                {
                  icon: "shield",
                  title: "Secure Checkout",
                  description: "256-bit SSL encryption",
                },
                {
                  icon: "truck",
                  title: "Free Shipping",
                  description: "On orders over $50",
                },
                {
                  icon: "return",
                  title: "Easy Returns",
                  description: "30-day return policy",
                },
                {
                  icon: "support",
                  title: "24/7 Support",
                  description: "Expert customer service",
                },
              ],
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "40px 20px",
            },
          },
        ],
        seo: {
          title: "Shopping Cart - Modern E-Commerce Store",
          description: "Review your cart and proceed to checkout",
          keywords: ["cart", "shopping cart", "checkout"],
        },
        layout: "default",
        is_active: true,
      },

      // ========================================
      // CHECKOUT PAGE
      // ========================================
      checkout: {
        sections: [
          // Section 1: Checkout Header
          {
            section_id: "checkout-header-1",
            type: "header",
            order: 1,
            visible: true,
            is_active: true,
            settings: {
              title: "Checkout",
              showLogo: true,
              showSteps: true,
              steps: ["Cart", "Information", "Shipping", "Payment"],
              currentStep: 2,
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "30px 20px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            },
          },

          // Section 2: Checkout Form
          {
            section_id: "checkout-form-2",
            type: "checkout",
            order: 2,
            visible: true,
            is_active: true,
            settings: {
              layout: "two-column",
              showGuestCheckout: true,
              requireAccount: false,
              showExpressCheckout: true,
              expressOptions: ["paypal", "apple-pay", "google-pay"],
              sections: {
                contact: {
                  enabled: true,
                  fields: ["email", "phone"],
                },
                shipping: {
                  enabled: true,
                  fields: ["firstName", "lastName", "address", "city", "state", "zip", "country"],
                },
                billing: {
                  enabled: true,
                  sameAsShipping: true,
                },
                payment: {
                  enabled: true,
                  methods: ["credit-card", "paypal", "stripe"],
                },
              },
              showOrderNotes: true,
              showCouponCode: true,
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "40px 20px",
              containerMaxWidth: "1280px",
              buttonColor: "#059669",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#047857",
              buttonPadding: "16px 48px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  layout: "single-column",
                },
                styles: {
                  padding: "20px 15px",
                },
              },
              tablet: {
                visible: true,
              },
            },
          },

          // Section 3: Order Summary
          {
            section_id: "checkout-summary-3",
            type: "checkout",
            order: 3,
            visible: true,
            is_active: true,
            settings: {
              position: "right",
              sticky: true,
              showProductImages: true,
              showProductDetails: true,
              showQuantity: true,
              showSubtotal: true,
              showShipping: true,
              showTax: true,
              showDiscount: true,
              showTotal: true,
              collapsible: true,
              collapsedByDefault: false,
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  sticky: false,
                  collapsedByDefault: true,
                },
              },
              tablet: {
                visible: true,
              },
            },
          },

          // Section 4: Security Badges
          {
            section_id: "checkout-security-4",
            type: "features",
            order: 4,
            visible: true,
            is_active: true,
            settings: {
              layout: "horizontal",
              centered: true,
              features: [
                {
                  icon: "lock",
                  title: "SSL Encrypted",
                  description: "Your data is protected",
                },
                {
                  icon: "shield",
                  title: "PCI Compliant",
                  description: "Secure payment processing",
                },
                {
                  icon: "badge",
                  title: "Money Back",
                  description: "100% guarantee",
                },
              ],
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#6B7280",
              padding: "40px 20px",
              fontSize: "14px",
            },
          },

          // Section 5: Help & Support
          {
            section_id: "checkout-help-5",
            type: "contact",
            order: 5,
            visible: true,
            is_active: true,
            settings: {
              title: "Need Help?",
              description: "Our customer service team is here to assist you",
              showPhone: true,
              phone: "1-800-123-4567",
              showEmail: true,
              email: "support@modernstore.com",
              showChat: true,
              layout: "inline",
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "30px 20px",
              textAlign: "center",
            },
          },
        ],
        seo: {
          title: "Checkout - Modern E-Commerce Store",
          description: "Securely complete your purchase",
          keywords: ["checkout", "payment", "secure checkout"],
        },
        layout: "full-width",
        is_active: true,
      },

      // ========================================
      // ABOUT PAGE
      // ========================================
      about: {
        sections: [
          // Section 1: Hero Section
          {
            section_id: "about-hero-1",
            type: "hero",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c",
            order: 1,
            visible: true,
            is_active: true,
            settings: {
              title: "About Modern Store",
              subtitle: "Your trusted fashion destination since 2020",
              description: "We're passionate about bringing you the latest trends and timeless classics",
              overlay: true,
              overlayOpacity: 0.5,
              minHeight: "500px",
            },
            styles: {
              backgroundColor: "#1F2937",
              backgroundImage: "https://images.unsplash.com/photo-1497366216548-37526070297c",
              backgroundSize: "cover",
              backgroundPosition: "center",
              textColor: "#FFFFFF",
              padding: "120px 20px",
              minHeight: "500px",
              textAlign: "center",
            },
          },

          // Section 2: Our Story
          {
            section_id: "about-story-2",
            type: "about",
            order: 2,
            visible: true,
            is_active: true,
            settings: {
              title: "Our Story",
              subtitle: "How it all began",
              content:
                "Founded in 2020, Modern Store started with a simple mission: to make fashion accessible to everyone. What began as a small online boutique has grown into a leading e-commerce platform serving customers worldwide. We believe that style should be effortless, affordable, and sustainable.",
              layout: "two-column",
              imagePosition: "left",
              image: "https://images.unsplash.com/photo-1556745753-b2904692b3cd",
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "80px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  layout: "single-column",
                },
                styles: {
                  padding: "40px 20px",
                },
              },
            },
          },

          // Section 3: Our Values
          {
            section_id: "about-values-3",
            type: "features",
            order: 3,
            visible: true,
            is_active: true,
            settings: {
              title: "Our Values",
              subtitle: "What drives us every day",
              layout: "grid",
              columns: 3,
              features: [
                {
                  icon: "heart",
                  title: "Customer First",
                  description:
                    "Your satisfaction is our top priority. We go above and beyond to ensure you have the best shopping experience.",
                },
                {
                  icon: "leaf",
                  title: "Sustainability",
                  description:
                    "We're committed to reducing our environmental impact through eco-friendly packaging and sustainable sourcing.",
                },
                {
                  icon: "star",
                  title: "Quality",
                  description:
                    "We carefully curate our collection to bring you only the finest products from trusted brands.",
                },
                {
                  icon: "users",
                  title: "Community",
                  description:
                    "We believe in building a community of fashion enthusiasts who inspire and support each other.",
                },
                {
                  icon: "globe",
                  title: "Innovation",
                  description:
                    "We continuously evolve our platform to provide you with the latest technology and features.",
                },
                {
                  icon: "shield-check",
                  title: "Trust",
                  description:
                    "Transparency and honesty are at the core of everything we do. Your trust is our greatest asset.",
                },
              ],
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "80px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                },
                styles: {
                  padding: "40px 20px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 2,
                },
              },
            },
          },

          // Section 4: Team Section
          {
            section_id: "about-team-4",
            type: "about",
            order: 4,
            visible: true,
            is_active: true,
            settings: {
              title: "Meet Our Team",
              subtitle: "The people behind Modern Store",
              layout: "grid",
              columns: 4,
              team: [
                {
                  name: "Sarah Johnson",
                  position: "Founder & CEO",
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                  bio: "Visionary leader with 15 years in fashion retail",
                },
                {
                  name: "Michael Chen",
                  position: "Head of Design",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
                  bio: "Creative director passionate about innovative designs",
                },
                {
                  name: "Emma Davis",
                  position: "Marketing Director",
                  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
                  bio: "Digital marketing expert driving brand growth",
                },
                {
                  name: "James Wilson",
                  position: "Operations Manager",
                  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
                  bio: "Logistics specialist ensuring smooth operations",
                },
              ],
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "80px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                },
                styles: {
                  padding: "40px 20px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 2,
                },
              },
            },
          },

          // Section 5: CTA Section
          {
            section_id: "about-cta-5",
            type: "cta",
            order: 5,
            visible: true,
            is_active: true,
            settings: {
              title: "Join Our Fashion Community",
              description: "Sign up for exclusive offers, style tips, and early access to new collections",
              buttonText: "Subscribe Now",
              buttonLink: "/newsletter",
              showEmailInput: true,
              backgroundStyle: "gradient",
            },
            styles: {
              backgroundColor: "#2563EB",
              textColor: "#FFFFFF",
              padding: "80px 20px",
              textAlign: "center",
              buttonColor: "#F59E0B",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#D97706",
              buttonPadding: "16px 40px",
            },
            responsive: {
              mobile: {
                visible: true,
                styles: {
                  padding: "60px 20px",
                },
              },
            },
          },
        ],
        seo: {
          title: "About Us - Modern E-Commerce Store",
          description:
            "Learn about Modern Store's mission, values, and the team behind your favorite fashion destination",
          keywords: ["about us", "our story", "team", "mission", "values"],
          ogImage: "https://images.unsplash.com/photo-1497366216548-37526070297c",
        },
        layout: "default",
        is_active: true,
      },

      // ========================================
      // CONTACT PAGE
      // ========================================
      contact: {
        sections: [
          // Section 1: Page Header
          {
            section_id: "contact-header-1",
            type: "header",
            order: 1,
            visible: true,
            is_active: true,
            settings: {
              title: "Get In Touch",
              subtitle: "We'd love to hear from you",
              breadcrumb: true,
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "60px 20px",
              textAlign: "center",
            },
          },

          // Section 2: Contact Information
          {
            section_id: "contact-info-2",
            type: "contact",
            order: 2,
            visible: true,
            is_active: true,
            settings: {
              layout: "grid",
              columns: 3,
              showPhone: true,
              phone: "1-800-123-4567",
              showEmail: true,
              email: "support@modernstore.com",
              showAddress: true,
              address: {
                street: "123 Fashion Avenue",
                city: "New York",
                state: "NY",
                zip: "10001",
                country: "USA",
              },
              showSocial: true,
              socialLinks: {
                facebook: "https://facebook.com/modernstore",
                instagram: "https://instagram.com/modernstore",
                twitter: "https://twitter.com/modernstore",
                pinterest: "https://pinterest.com/modernstore",
              },
              showHours: true,
              hours: {
                weekdays: "9:00 AM - 6:00 PM EST",
                saturday: "10:00 AM - 4:00 PM EST",
                sunday: "Closed",
              },
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "60px 20px",
              containerMaxWidth: "1280px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  columns: 1,
                },
                styles: {
                  padding: "40px 20px",
                },
              },
              tablet: {
                visible: true,
                settings: {
                  columns: 2,
                },
              },
            },
          },

          // Section 3: Contact Form
          {
            section_id: "contact-form-3",
            type: "contact",
            order: 3,
            visible: true,
            is_active: true,
            settings: {
              title: "Send Us a Message",
              subtitle: "Fill out the form below and we'll get back to you soon",
              layout: "two-column",
              formPosition: "left",
              fields: [
                {
                  name: "name",
                  type: "text",
                  label: "Full Name",
                  required: true,
                  placeholder: "John Doe",
                },
                {
                  name: "email",
                  type: "email",
                  label: "Email Address",
                  required: true,
                  placeholder: "john@example.com",
                },
                {
                  name: "phone",
                  type: "tel",
                  label: "Phone Number",
                  required: false,
                  placeholder: "(555) 123-4567",
                },
                {
                  name: "subject",
                  type: "select",
                  label: "Subject",
                  required: true,
                  options: [
                    "General Inquiry",
                    "Order Support",
                    "Product Question",
                    "Returns & Refunds",
                    "Partnership",
                    "Other",
                  ],
                },
                {
                  name: "message",
                  type: "textarea",
                  label: "Message",
                  required: true,
                  placeholder: "How can we help you?",
                  rows: 6,
                },
              ],
              submitButtonText: "Send Message",
              showMap: true,
              mapEmbedUrl: "https://www.google.com/maps/embed?pb=...",
            },
            styles: {
              backgroundColor: "#F9FAFB",
              textColor: "#1F2937",
              padding: "80px 20px",
              containerMaxWidth: "1280px",
              buttonColor: "#2563EB",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#1D4ED8",
              buttonPadding: "14px 32px",
            },
            responsive: {
              mobile: {
                visible: true,
                settings: {
                  layout: "single-column",
                },
                styles: {
                  padding: "40px 20px",
                },
              },
            },
          },

          // Section 4: FAQ Quick Links
          {
            section_id: "contact-faq-4",
            type: "faq",
            order: 4,
            visible: true,
            is_active: true,
            settings: {
              title: "Frequently Asked Questions",
              subtitle: "Find quick answers to common questions",
              layout: "accordion",
              showViewAll: true,
              viewAllLink: "/faq",
              questions: [
                {
                  question: "What are your shipping options?",
                  answer:
                    "We offer standard (5-7 days), express (2-3 days), and overnight shipping. Free standard shipping on orders over $50.",
                },
                {
                  question: "What is your return policy?",
                  answer:
                    "We accept returns within 30 days of purchase. Items must be unworn with original tags attached.",
                },
                {
                  question: "How can I track my order?",
                  answer:
                    "Once your order ships, you'll receive a tracking number via email. You can also track your order in your account dashboard.",
                },
                {
                  question: "Do you ship internationally?",
                  answer:
                    "Yes, we ship to over 100 countries worldwide. International shipping rates vary by destination.",
                },
              ],
            },
            styles: {
              backgroundColor: "#FFFFFF",
              textColor: "#1F2937",
              padding: "80px 20px",
              containerMaxWidth: "1000px",
            },
            responsive: {
              mobile: {
                visible: true,
                styles: {
                  padding: "40px 20px",
                },
              },
            },
          },

          // Section 5: Newsletter Signup
          {
            section_id: "contact-newsletter-5",
            type: "cta",
            order: 5,
            visible: true,
            is_active: true,
            settings: {
              title: "Stay Connected",
              description: "Subscribe to our newsletter for exclusive offers and updates",
              buttonText: "Subscribe",
              showEmailInput: true,
              emailPlaceholder: "Enter your email address",
            },
            styles: {
              backgroundColor: "#2563EB",
              textColor: "#FFFFFF",
              padding: "60px 20px",
              textAlign: "center",
              buttonColor: "#F59E0B",
              buttonTextColor: "#FFFFFF",
              buttonHoverColor: "#D97706",
            },
          },
        ],
        seo: {
          title: "Contact Us - Modern E-Commerce Store",
          description:
            "Get in touch with our customer service team. We're here to help with any questions or concerns.",
          keywords: ["contact", "support", "customer service", "help"],
        },
        layout: "default",
        is_active: true,
      },
    },

    // ============================================================================
    // THEME SETTINGS
    // ============================================================================
    settings: {
      enableWishlist: true,
      enableCompare: true,
      enableQuickView: true,
      enableProductReviews: true,
      enableBlog: true,
      enableNewsletter: true,
      enableChatSupport: true,
      currencySymbol: "$",
      currencyPosition: "before",
      dateFormat: "MM/DD/YYYY",
    },

    // ============================================================================
    // METADATA
    // ============================================================================
    metadata: {
      author: "Modern Store Team",
      tags: ["ecommerce", "fashion", "modern", "responsive", "customizable"],
      category: "fashion",
    },

    // ============================================================================
    // VERSION HISTORY
    // ============================================================================
    version_history: [
      {
        version: "1.0.0",
        changes: "Initial release with complete e-commerce functionality",
        created_at: new Date(),
      },
    ],
  },
];
