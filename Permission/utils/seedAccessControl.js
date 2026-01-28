import dotenv from "dotenv";
import PermissionModel from "../permissionModel.js";
import RoleModel from "../../Role/roleModel.js";

dotenv.config();

/**
 * Seed Access Control Script (Permissions & Roles)
 *
 * Usage:
 *   node utils/seedAccessControl.js <tenant-id>
 *   npm run seed -- <tenant-id>
 */

const permissionsList = [
  // Products
  { key: "product:create", description: "Create new products", category: "Products", is_system: true },
  { key: "product:read", description: "View products", category: "Products", is_system: true },
  { key: "product:update", description: "Update existing products", category: "Products", is_system: true },
  { key: "product:delete", description: "Delete products", category: "Products", is_system: true },

  // Industries
  { key: "industry:create", description: "Create new industries", category: "Industries", is_system: true },
  { key: "industry:read", description: "View industries", category: "Industries", is_system: true },
  { key: "industry:update", description: "Update industries", category: "Industries", is_system: true },
  { key: "industry:delete", description: "Delete industries", category: "Industries", is_system: true },

  // Orders
  { key: "order:create", description: "Create new orders", category: "Orders", is_system: true },
  { key: "order:read", description: "View orders", category: "Orders", is_system: true },
  { key: "order:update", description: "Update order status", category: "Orders", is_system: true },
  { key: "order:delete", description: "Cancel/delete orders", category: "Orders", is_system: true },

  // Categories
  { key: "category:create", description: "Create new categories", category: "Categories", is_system: true },
  { key: "category:read", description: "View categories", category: "Categories", is_system: true },
  { key: "category:update", description: "Update categories", category: "Categories", is_system: true },
  { key: "category:delete", description: "Delete categories", category: "Categories", is_system: true },

  // Brands
  { key: "brand:create", description: "Create new brands", category: "Brands", is_system: true },
  { key: "brand:read", description: "View brands", category: "Brands", is_system: true },
  { key: "brand:update", description: "Update brands", category: "Brands", is_system: true },
  { key: "brand:delete", description: "Delete brands", category: "Brands", is_system: true },

  // Users
  { key: "user:create", description: "Create new users", category: "Users", is_system: true },
  { key: "user:read", description: "View user profiles", category: "Users", is_system: true },
  { key: "user:update", description: "Update user profiles", category: "Users", is_system: true },
  { key: "user:delete", description: "Delete users", category: "Users", is_system: true },

  // Banners
  { key: "banner:create", description: "Create banners", category: "Banners", is_system: true },
  { key: "banner:read", description: "View banners", category: "Banners", is_system: true },
  { key: "banner:update", description: "Update banners", category: "Banners", is_system: true },
  { key: "banner:delete", description: "Delete banners", category: "Banners", is_system: true },

  // Dashboard
  { key: "dashboard:view", description: "Access dashboard", category: "Dashboard", is_system: true },

  // Wishlists
  { key: "wishlist:read", description: "View wishlists", category: "Wishlists", is_system: true },
  { key: "wishlist:update", description: "Manage wishlists", category: "Wishlists", is_system: true },

  // Cart
  { key: "cart:read", description: "View cart", category: "Cart", is_system: true },
  { key: "cart:update", description: "Manage cart", category: "Cart", is_system: true },

  // Reviews
  { key: "review:create", description: "Write product reviews", category: "Reviews", is_system: true },
  { key: "review:read", description: "View product reviews", category: "Reviews", is_system: true },
  { key: "review:delete", description: "Delete reviews", category: "Reviews", is_system: true },

  // Notifications
  { key: "notification:send", description: "Send notifications", category: "Notifications", is_system: true },
  { key: "notification:read", description: "View notifications", category: "Notifications", is_system: true },

  // Configs
  { key: "config:update", description: "Update app configurations", category: "Configs", is_system: true },
  { key: "config:read", description: "View app configurations", category: "Configs", is_system: true },

  // Sale Trends
  { key: "saletrend:create", description: "Create sale trends", category: "Sale Trends", is_system: true },
  { key: "saletrend:read", description: "View sale trends", category: "Sale Trends", is_system: true },
  { key: "saletrend:update", description: "Update sale trends", category: "Sale Trends", is_system: true },
  { key: "saletrend:delete", description: "Delete sale trends", category: "Sale Trends", is_system: true },

  // coupons
  { key: "coupon:create", description: "Create coupon", category: "Coupons", is_system: true },
  { key: "coupon:read", description: "View coupon", category: "Coupons", is_system: true },
  { key: "coupon:update", description: "Update coupon", category: "Coupons", is_system: true },
  { key: "coupon:delete", description: "Delete coupon", category: "Coupons", is_system: true },

  // Contact info
  { key: "contactinfo:create", description: "Create contact info", category: "Contact Info", is_system: true },
  { key: "contactinfo:read", description: "View contact info", category: "Contact Info", is_system: true },
  { key: "contactinfo:update", description: "Update contact info", category: "Contact Info", is_system: true },
  { key: "contactinfo:delete", description: "Delete contact info", category: "Contact Info", is_system: true },

  // FAQ
  { key: "faq:create", description: "Create faq", category: "FAQ", is_system: true },
  { key: "faq:read", description: "View faq", category: "FAQ", is_system: true },
  { key: "faq:update", description: "Update faq", category: "FAQ", is_system: true },
  { key: "faq:delete", description: "Delete faq", category: "FAQ", is_system: true },

  // Ticket
  { key: "ticket:create", description: "Create ticket", category: "Ticket", is_system: true },
  { key: "ticket:read", description: "View ticket", category: "Ticket", is_system: true },
  { key: "ticket:update", description: "Update ticket", category: "Ticket", is_system: true },
  { key: "ticket:delete", description: "Delete ticket", category: "Ticket", is_system: true },

  // Payments
  { key: "payment:create", description: "Create payment", category: "Payments", is_system: true },
  { key: "payment:read", description: "View payment", category: "Payments", is_system: true },
  { key: "payment:update", description: "Update payment", category: "Payments", is_system: true },
  { key: "payment:delete", description: "Delete payment", category: "Payments", is_system: true },

  // Business
  { key: "business:create", description: "Create business", category: "Business", is_system: true },
  { key: "business:read", description: "View business", category: "Business", is_system: true },
  { key: "business:update", description: "Update business", category: "Business", is_system: true },
  { key: "business:delete", description: "Delete business", category: "Business", is_system: true },

  // Role
  { key: "role:create", description: "Create role", category: "Role", is_system: true },
  { key: "role:read", description: "View role", category: "Role", is_system: true },
  { key: "role:update", description: "Update role", category: "Role", is_system: true },
  { key: "role:delete", description: "Delete role", category: "Role", is_system: true },
];

const seedAccessControl = async (tenantId) => {
  try {
    console.log(`\n🌱 Starting Access Control Seeding for Tenant: ${tenantId}`);
    console.log("=================================================");

    const PermissionModelDB = await PermissionModel(tenantId);
    const RoleModelDB = await RoleModel(tenantId);

    /* -------------------------------------------------------------------------- */
    /*                             1. Seed Permissions                            */
    /* -------------------------------------------------------------------------- */
    console.log("\n🔹 Step 1: Seeding Permissions...");

    // Insert permissions (skipping duplicates)
    try {
      const result = await PermissionModelDB.insertMany(permissionsList, {
        ordered: false,
      });
      console.log(`   ✅ Inserted ${result.length} new permissions.`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`   ⚠️  Permissions already exist (skipped duplicates).`);
        console.log(`   ℹ️  Inserted: ${error.result?.nInserted || 0}, Errors: ${error.writeErrors?.length || 0}`);
      } else {
        throw error;
      }
    }

    const totalPermissions = await PermissionModelDB.countDocuments();
    console.log(`   📦 Total Permissions in DB: ${totalPermissions}`);

    /* -------------------------------------------------------------------------- */
    /*                                2. Seed Roles                               */
    /* -------------------------------------------------------------------------- */
    console.log("\n🔹 Step 2: Seeding Roles...");

    // Fetch all permissions from DB to get their ObjectIds
    const allPermissions = await PermissionModelDB.find({}).select("_id key");

    // Helper helpers
    const getPermIds = (keys) => allPermissions.filter((p) => keys.includes(p.key)).map((p) => p._id);
    const getAllPermIds = () => allPermissions.map((p) => p._id);

    // Role Definitions
    const rolesList = [
      {
        name: "admin",
        permissions: getAllPermIds(),
        is_system_role: true,
      },
      {
        name: "employee",
        permissions: getPermIds([
          "product:read",
          "product:update",
          "order:create",
          "order:read",
          "order:update",
          "category:read",
          "industry:read",
          "brand:read",
          "user:read",
          "dashboard:view",
          "notification:send",
          "notification:read",
          "saletrend:read",
          "coupon:read",
          "contactinfo:read",
          "faq:read",
          "ticket:read",
          "ticket:update",
          "payment:read",
          "business:read",
          "business:update",
        ]),
        is_system_role: true,
      },
      {
        name: "user",
        permissions: getPermIds([
          "product:read",
          "order:create",
          "order:read",
          "category:read",
          "industry:read",
          "brand:read",
          "wishlist:read",
          "wishlist:update",
          "cart:read",
          "cart:update",
          "review:create",
          "review:read",
          "notification:read",
          "saletrend:read",
          "coupon:read",
          "contactinfo:read",
          "faq:read",
          "ticket:read",
          "ticket:create",
          "payment:read",
          "business:create",
          "business:read",
          "business:update",
          "business:delete",
        ]),
        is_system_role: true,
      },
    ];

    for (const roleData of rolesList) {
      const existingRole = await RoleModelDB.findOne({ name: roleData.name });
      if (existingRole) {
        existingRole.permissions = roleData.permissions;
        existingRole.is_system_role = roleData.is_system_role;
        await existingRole.save();
        console.log(`   ✅ Updated Role: ${roleData.name}`);
      } else {
        await RoleModelDB.create(roleData);
        console.log(`   ✅ Created Role: ${roleData.name}`);
      }
    }

    console.log("\n✅ Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error Seeding Data:", error.message);
    process.exit(1);
  }
};

// Get tenant ID from command line arguments
const tenantId = process.argv[2];

if (!tenantId) {
  console.error("❌ Error: Tenant ID is required.");
  console.log("   Usage: npm run seed -- <tenant-id>");
  console.log("   Example: npm run seed -- tenant_123");
  process.exit(1);
}

seedAccessControl(tenantId);
