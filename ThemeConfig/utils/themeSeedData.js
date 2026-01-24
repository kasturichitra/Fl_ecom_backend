// themeSeeds.js  (Full e-commerce seed – every page has minimum 5 sections)

export const themeTemplates = [
  {
    template_name: "Luxury Premium – Full Seed",
    template_id: "luxury-premium-full-2026",
    description: "Complete e-commerce theme with all pages seeded (minimum 5 sections each)",
    version: "2.0.0",
    status: "published",
    is_active: true,
    thumbnail: "/themes/luxury-premium-full.jpg",

    global_style: {
      primaryColor: "#D4AF37",
      secondaryColor: "#1F2937",
      accentColor: "#B8860B",
      backgroundColor: "#FFFFFF",
      surfaceColor: "#F9FAFB",
      textColor: "#111827",
      fontFamily: "Playfair Display, serif",
      headingFontFamily: "Playfair Display, serif",
      containerMaxWidth: "1440px",
      borderRadius: "4px",
      buttons: {
        primary: {
          variant: "solid",
          backgroundColor: "#D4AF37",
          textColor: "#1F2937",
          padding: "18px 48px",
          borderRadius: "4px",
          fontWeight: "600",
          letterSpacing: "1.5px",
        },
      },
    },

    pages: {
      // 1. Home
      home: {
        sections: [
          {
            section_id: "hero-home-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: {
              title: "Timeless Luxury",
              subtitle: "Curated for the Discerning",
              buttonText: "Shop Now",
              buttonLink: "/products",
              height: "90vh",
            },
            styles: {
              backgroundType: "image",
              backgroundImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80",
              backgroundSize: "cover",
              textColor: "#ffffff",
              titleFontSize: "5.5rem",
            },
          },
          {
            section_id: "featured-collections-1",
            type: "category",
            order: 2,
            visible: true,
            settings: { title: "Signature Collections", layout: "grid", columns: 4 },
            styles: { padding: "120px 5%" },
          },
          {
            section_id: "featured-products-1",
            type: "product",
            order: 3,
            visible: true,
            settings: { title: "Best Sellers", itemsPerRow: 4, showPrice: true },
            styles: { backgroundColor: "#f8f1e9", padding: "120px 5%" },
          },
          {
            section_id: "testimonial-1",
            type: "testimonial",
            order: 4,
            visible: true,
            settings: { title: "Our Clients Say", layout: "carousel", showRating: true },
            styles: { padding: "120px 5%" },
          },
          {
            section_id: "newsletter-1",
            type: "newsletter",
            order: 5,
            visible: true,
            settings: { title: "Join the Exclusive List", subtitle: "Receive private invitations" },
            styles: { backgroundColor: "#1f2937", textColor: "#ffffff", padding: "100px 5%" },
          },
        ],
      },

      // 2. Products (Collection page)
      products: {
        sections: [
          {
            section_id: "products-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "All Collections", height: "50vh" },
            styles: {
              backgroundType: "image",
              backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80",
              backgroundSize: "cover",
            },
          },
          {
            section_id: "products-filters-1",
            type: "product",
            order: 2,
            visible: true,
            settings: { showFilters: true, showSort: true, layout: "grid", itemsPerRow: 4 },
          },
          {
            section_id: "products-grid-1",
            type: "product",
            order: 3,
            visible: true,
            settings: { title: "Our Products", itemsPerRow: 4, showPrice: true, showQuickView: true },
          },
          {
            section_id: "products-banner-1",
            type: "banner",
            order: 4,
            visible: true,
            settings: { title: "New Arrivals – 20% Off", buttonText: "Shop Now" },
          },
          {
            section_id: "products-pagination-1",
            type: "pagination",
            order: 5,
            visible: true,
            settings: { style: "numbers", showPrevNext: true },
          },
        ],
      },

      // 3. Single Product
      product: {
        sections: [
          {
            section_id: "product-main-1",
            type: "product",
            order: 1,
            visible: true,
            settings: { layout: "gallery-left", showReviews: true, showRelated: true, showSizeGuide: true },
          },
          {
            section_id: "product-description-1",
            type: "product",
            order: 2,
            visible: true,
            settings: { showTabs: true, tabs: ["Description", "Details", "Shipping", "Reviews"] },
          },
          {
            section_id: "product-related-1",
            type: "product",
            order: 3,
            visible: true,
            settings: { title: "You May Also Like", itemsPerRow: 4 },
          },
          {
            section_id: "product-recently-viewed-1",
            type: "product",
            order: 4,
            visible: true,
            settings: { title: "Recently Viewed", itemsPerRow: 4 },
          },
          {
            section_id: "product-upsell-1",
            type: "product",
            order: 5,
            visible: true,
            settings: { title: "Frequently Bought Together", itemsPerRow: 3 },
          },
        ],
      },

      // 4. Cart
      cart: {
        sections: [
          {
            section_id: "cart-header-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Your Cart", height: "300px" },
          },
          {
            section_id: "cart-items-1",
            type: "cart",
            order: 2,
            visible: true,
            settings: { showCoupon: true, showSaveLater: true, layout: "list" },
          },
          {
            section_id: "cart-summary-1",
            type: "cart",
            order: 3,
            visible: true,
            settings: { showSummary: true, showShipping: true },
          },
          {
            section_id: "cart-recommendations-1",
            type: "product",
            order: 4,
            visible: true,
            settings: { title: "You May Also Like", itemsPerRow: 4 },
          },
          {
            section_id: "cart-cta-1",
            type: "cta",
            order: 5,
            visible: true,
            settings: { title: "Ready to Checkout?", buttonText: "Proceed to Checkout" },
          },
        ],
      },

      // 5. Checkout
      checkout: {
        sections: [
          {
            section_id: "checkout-progress-1",
            type: "checkout",
            order: 1,
            visible: true,
            settings: { showProgressBar: true, steps: ["Shipping", "Payment", "Review"] },
          },
          {
            section_id: "checkout-form-1",
            type: "checkout",
            order: 2,
            visible: true,
            settings: { showShippingForm: true, showBillingForm: true, allowGuestCheckout: true },
          },
          {
            section_id: "checkout-summary-1",
            type: "checkout",
            order: 3,
            visible: true,
            settings: { showOrderSummary: true, showSecurityBadge: true },
          },
          {
            section_id: "checkout-upsell-1",
            type: "product",
            order: 4,
            visible: true,
            settings: { title: "Add Gift Wrapping", itemsPerRow: 2 },
          },
          {
            section_id: "checkout-cta-1",
            type: "cta",
            order: 5,
            visible: true,
            settings: { title: "Complete Your Order", buttonText: "Place Order" },
          },
        ],
      },

      // 6. Wishlist
      wishlist: {
        sections: [
          {
            section_id: "wishlist-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "My Wishlist", subtitle: "Your favorite items saved for later" },
          },
          {
            section_id: "wishlist-items-1",
            type: "wishlist",
            order: 2,
            visible: true,
            settings: { showMoveToCart: true, showRemove: true, itemsPerRow: 4 },
          },
          {
            section_id: "wishlist-recommendations-1",
            type: "product",
            order: 3,
            visible: true,
            settings: { title: "You Might Like", itemsPerRow: 4 },
          },
          {
            section_id: "wishlist-cta-1",
            type: "cta",
            order: 4,
            visible: true,
            settings: { title: "Start Shopping", buttonText: "Browse Products" },
          },
          {
            section_id: "wishlist-empty-1",
            type: "hero",
            order: 5,
            visible: true,
            settings: { title: "Your Wishlist is Empty", subtitle: "Add items you love" },
          },
        ],
      },

      // 7. Profile / Account
      profile: {
        sections: [
          {
            section_id: "profile-hero-1",
            type: "account",
            order: 1,
            visible: true,
            settings: { showAvatar: true, showUserInfo: true, layout: "banner" },
          },
          {
            section_id: "profile-tabs-1",
            type: "account",
            order: 2,
            visible: true,
            settings: { showTabs: true, tabs: ["Profile", "Orders", "Addresses", "Wishlist"] },
          },
          {
            section_id: "profile-content-1",
            type: "profile",
            order: 3,
            visible: true,
            settings: { showPersonalInfo: true, showAddresses: true, allowEdit: true },
          },
          {
            section_id: "profile-recent-orders-1",
            type: "account",
            order: 4,
            visible: true,
            settings: { showRecentOrders: true, limit: 5 },
          },
          {
            section_id: "profile-cta-1",
            type: "cta",
            order: 5,
            visible: true,
            settings: { title: "Need Help?", buttonText: "Contact Support" },
          },
        ],
      },

      // 8. Orders
      orders: {
        sections: [
          {
            section_id: "orders-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Order History", subtitle: "Track and manage your purchases" },
          },
          {
            section_id: "orders-filters-1",
            type: "account",
            order: 2,
            visible: true,
            settings: { showFilters: true, showSearch: true },
          },
          {
            section_id: "orders-list-1",
            type: "account",
            order: 3,
            visible: true,
            settings: { layout: "list", showStatus: true, showTracking: true },
          },
          { section_id: "orders-pagination-1", type: "pagination", order: 4, visible: true },
          {
            section_id: "orders-cta-1",
            type: "cta",
            order: 5,
            visible: true,
            settings: { title: "Continue Shopping", buttonText: "Shop Now" },
          },
        ],
      },

      // 9. Order Details
      order_details: {
        sections: [
          {
            section_id: "order-details-header-1",
            type: "account",
            order: 1,
            visible: true,
            settings: { showOrderNumber: true, showStatus: true },
          },
          {
            section_id: "order-details-timeline-1",
            type: "account",
            order: 2,
            visible: true,
            settings: { showTimeline: true, showTracking: true },
          },
          {
            section_id: "order-details-items-1",
            type: "account",
            order: 3,
            visible: true,
            settings: { showItems: true, showPricing: true },
          },
          {
            section_id: "order-details-shipping-1",
            type: "account",
            order: 4,
            visible: true,
            settings: { showShippingAddress: true, showPaymentMethod: true },
          },
          {
            section_id: "order-details-actions-1",
            type: "account",
            order: 5,
            visible: true,
            settings: { showInvoice: true, allowCancellation: true },
          },
        ],
      },

      // 10. About Us
      about: {
        sections: [
          {
            section_id: "about-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Our Story", height: "600px" },
            styles: {
              backgroundType: "image",
              backgroundImage: "https://images.unsplash.com/photo-1521737711867-e3b827c2982f?auto=format&fit=crop&q=80",
            },
          },
          {
            section_id: "about-story-1",
            type: "about",
            order: 2,
            visible: true,
            settings: { title: "Heritage & Craft", content: "<p>Founded in 1998...</p>", imagePosition: "right" },
          },
          {
            section_id: "about-mission-1",
            type: "about",
            order: 3,
            visible: true,
            settings: { title: "Our Mission", content: "<p>To deliver timeless luxury...</p>", imagePosition: "left" },
          },
          {
            section_id: "about-values-1",
            type: "about",
            order: 4,
            visible: true,
            settings: { title: "Our Values", layout: "grid", columns: 3 },
          },
          {
            section_id: "about-team-1",
            type: "about",
            order: 5,
            visible: true,
            settings: { title: "Meet the Team", layout: "grid", columns: 4 },
          },
        ],
      },

      // 11. Contact
      contact: {
        sections: [
          {
            section_id: "contact-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Get in Touch", subtitle: "We’d love to hear from you" },
          },
          {
            section_id: "contact-info-1",
            type: "contact",
            order: 2,
            visible: true,
            settings: { showAddress: true, showPhone: true, showEmail: true, layout: "grid" },
          },
          {
            section_id: "contact-form-1",
            type: "contact",
            order: 3,
            visible: true,
            settings: { showForm: true, formFields: ["name", "email", "message"] },
          },
          {
            section_id: "contact-map-1",
            type: "contact",
            order: 4,
            visible: true,
            settings: { showMap: true, mapHeight: "500px" },
          },
          {
            section_id: "contact-cta-1",
            type: "cta",
            order: 5,
            visible: true,
            settings: { title: "Need Immediate Help?", buttonText: "Call Us Now" },
          },
        ],
      },

      // 12. Blog
      blog: {
        sections: [
          {
            section_id: "blog-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Our Journal", subtitle: "Stories, Inspiration & Insights" },
          },
          {
            section_id: "blog-featured-1",
            type: "blog",
            order: 2,
            visible: true,
            settings: { title: "Featured Posts", layout: "carousel", maxItems: 3 },
          },
          {
            section_id: "blog-filters-1",
            type: "blog",
            order: 3,
            visible: true,
            settings: { showCategories: true, showSearch: true },
          },
          {
            section_id: "blog-list-1",
            type: "blog",
            order: 4,
            visible: true,
            settings: { layout: "grid", itemsPerRow: 3, showExcerpt: true },
          },
          { section_id: "blog-pagination-1", type: "pagination", order: 5, visible: true },
        ],
      },

      // 13. Blog Post
      blog_post: {
        sections: [
          {
            section_id: "blog-post-header-1",
            type: "blog",
            order: 1,
            visible: true,
            settings: { showFeaturedImage: true, showTitle: true, showMeta: true },
          },
          {
            section_id: "blog-post-content-1",
            type: "blog",
            order: 2,
            visible: true,
            settings: { showContent: true, showTableOfContents: true },
          },
          {
            section_id: "blog-post-share-1",
            type: "blog",
            order: 3,
            visible: true,
            settings: { showShare: true, shareButtons: ["facebook", "twitter", "linkedin"] },
          },
          {
            section_id: "blog-post-author-1",
            type: "blog",
            order: 4,
            visible: true,
            settings: { showAuthorBio: true },
          },
          {
            section_id: "blog-post-related-1",
            type: "blog",
            order: 5,
            visible: true,
            settings: { showRelated: true, maxRelated: 3 },
          },
        ],
      },

      // 14. FAQ
      faq: {
        sections: [
          {
            section_id: "faq-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Frequently Asked Questions", subtitle: "Find answers quickly" },
          },
          {
            section_id: "faq-search-1",
            type: "search",
            order: 2,
            visible: true,
            settings: { showSearch: true, placeholder: "Search FAQs..." },
          },
          {
            section_id: "faq-categories-1",
            type: "category",
            order: 3,
            visible: true,
            settings: { layout: "tabs", categories: ["General", "Orders", "Shipping", "Returns"] },
          },
          {
            section_id: "faq-list-1",
            type: "faq",
            order: 4,
            visible: true,
            settings: { layout: "accordion", allowMultipleOpen: false },
          },
          {
            section_id: "faq-contact-1",
            type: "cta",
            order: 5,
            visible: true,
            settings: { title: "Still have questions?", buttonText: "Contact Support" },
          },
        ],
      },

      // 15. Terms & Conditions
      terms_condition: {
        sections: [
          {
            section_id: "terms-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Terms & Conditions", subtitle: "Last updated January 2026" },
          },
          {
            section_id: "terms-toc-1",
            type: "about",
            order: 2,
            visible: true,
            settings: { showTableOfContents: true },
          },
          {
            section_id: "terms-content-1",
            type: "about",
            order: 3,
            visible: true,
            settings: { showContent: true, contentMaxWidth: "800px" },
          },
          {
            section_id: "terms-contact-1",
            type: "contact",
            order: 4,
            visible: true,
            settings: { title: "Questions?", buttonText: "Contact Us" },
          },
          { section_id: "terms-footer-1", type: "footer", order: 5, visible: true, settings: { showSocial: true } },
        ],
      },

      // 16. Privacy Policy
      privacy_policy: {
        sections: [
          {
            section_id: "privacy-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Privacy Policy", subtitle: "Your data is safe with us" },
          },
          {
            section_id: "privacy-toc-1",
            type: "about",
            order: 2,
            visible: true,
            settings: { showTableOfContents: true },
          },
          { section_id: "privacy-content-1", type: "about", order: 3, visible: true, settings: { showContent: true } },
          {
            section_id: "privacy-contact-1",
            type: "contact",
            order: 4,
            visible: true,
            settings: { title: "Questions about privacy?", buttonText: "Contact Us" },
          },
          { section_id: "privacy-footer-1", type: "footer", order: 5, visible: true },
        ],
      },

      // 17. Return Policy
      return_policy: {
        sections: [
          {
            section_id: "return-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Return Policy", subtitle: "Hassle-free returns within 30 days" },
          },
          {
            section_id: "return-toc-1",
            type: "about",
            order: 2,
            visible: true,
            settings: { showTableOfContents: true },
          },
          { section_id: "return-content-1", type: "about", order: 3, visible: true, settings: { showContent: true } },
          {
            section_id: "return-contact-1",
            type: "contact",
            order: 4,
            visible: true,
            settings: { title: "Need help with a return?", buttonText: "Contact Support" },
          },
          { section_id: "return-footer-1", type: "footer", order: 5, visible: true },
        ],
      },

      // 18. Refund Policy
      refund_policy: {
        sections: [
          {
            section_id: "refund-hero-1",
            type: "hero",
            order: 1,
            visible: true,
            settings: { title: "Refund Policy", subtitle: "Clear and transparent refunds" },
          },
          {
            section_id: "refund-toc-1",
            type: "about",
            order: 2,
            visible: true,
            settings: { showTableOfContents: true },
          },
          { section_id: "refund-content-1", type: "about", order: 3, visible: true, settings: { showContent: true } },
          {
            section_id: "refund-contact-1",
            type: "contact",
            order: 4,
            visible: true,
            settings: { title: "Questions about refunds?", buttonText: "Contact Us" },
          },
          { section_id: "refund-footer-1", type: "footer", order: 5, visible: true },
        ],
      },
    },

    // Settings, metadata, etc. remain same
    settings: {
      enableWishlist: true,
      enableCompare: true,
      enableQuickView: true,
      enableProductReviews: true,
      enableBlog: true,
      enableNewsletter: true,
    },
  },
];
