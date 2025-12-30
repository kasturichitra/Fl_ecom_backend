import dotenv from "dotenv";
import mongoose from "mongoose";
import FaqModel from "../../FAQ/faqModel.js";
import { mockFaqData as faqSeedData } from "../mockFaqData.js";

dotenv.config();

/**
 * Seed FAQs into ALL TENANT DATABASES
 * Assumes tenant DBs are named like: mydatabase<tenantId>_DB
 */

const seedFaqsForAllTenantDBs = async () => {
  try {
    console.log("\n🌱 Starting FAQ Seeding for ALL TENANT DATABASES");
    console.log("=================================================");

    // 1️⃣ CONNECT TO MONGO (ADMIN CONNECTION)
    await mongoose.connect(process.env.MONGODB_URL, {
      autoIndex: false,
    });

    console.log("✅ MongoDB connected");

    const admin = mongoose.connection.getClient().db().admin();

    // 2️⃣ LIST ALL DATABASES
    const { databases } = await admin.listDatabases();

    console.log("Databases found are : ", databases);

    // 3️⃣ FILTER TENANT DATABASES
    const tenantDatabases = databases
      .map((db) => db.name)
      .filter((name) => name.startsWith("mydatabase") && name.endsWith("_DB"));

    console.log("Tenant Databases found are : ", tenantDatabases);

    if (!tenantDatabases.length) {
      console.log("⚠️ No tenant databases found.");
      process.exit(0);
    }

    console.log(`\n🔎 Found ${tenantDatabases.length} tenant databases`);

    // 4️⃣ LOOP & SEED
    for (const tenantDbName of tenantDatabases) {
      console.log(`\n🔹 Seeding FAQs for DB: ${tenantDbName}`);

      try {
        const tenantId = tenantDbName.replace("mydatabase", "").replace("_DB", "");
        // IMPORTANT: pass DB NAME as tenantId
        const FaqModelDB = await FaqModel(tenantId);

        await FaqModelDB.insertMany(faqSeedData, {
          ordered: false,
        });

        const count = await FaqModelDB.countDocuments();
        console.log(`   ✅ FAQs seeded. Total FAQs: ${count}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log("   ⚠️ Duplicates skipped.");
        } else {
          console.error(`   ❌ Error in ${tenantDbName}:`, error.message);
        }
      }
    }

    console.log("\n✅ FAQ Seeding Completed for ALL TENANT DATABASES!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Global FAQ Seeding Error:", error.message);
    process.exit(1);
  }
};

seedFaqsForAllTenantDBs();
