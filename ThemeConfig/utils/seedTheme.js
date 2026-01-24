// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import ThemeModel from "../themeModel.js";
// import { themeTemplates } from "./themeSeedData.js";
// dotenv.config();

// const seedThemeForAllTenantDBs = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL, {
//       autoIndex: false,
//     });

//     const admin = mongoose.connection.getClient().db().admin();

//     const { databases } = await admin.listDatabases();

//     const tenantDatabases = databases
//       .map((db) => db.name)
//       .filter((name) => name.startsWith("mydatabase") && name.endsWith("_DB"));

//     if (!tenantDatabases.length) {
//       console.log("⚠️ No tenant databases found.");
//       process.exit(0);
//     }

//     console.log(`\n🔎 Found ${tenantDatabases.length} tenant databases`);

//     for (const tenantDbName of tenantDatabases) {
//       console.log(`\n🔹 Seeding Theme for DB: ${tenantDbName}`);

//       try {
//         const tenantId = tenantDbName.replace("mydatabase", "").replace("_DB", "");
//         const ThemeModelDB = await ThemeModel(tenantId);

//         await ThemeModelDB.insertMany(themeTemplates, {
//           ordered: false,
//         });

//         const count = await ThemeModelDB.countDocuments();
//         console.log(`   ✅ Theme seeded. Total Themes: ${count}`);
//       } catch (error) {
//         if (error.code === 11000) {
//           console.log("   ⚠️ Duplicates skipped.");
//         } else {
//           console.error(`   ❌ Error in ${tenantDbName}:`, error.message);
//         }
//       }
//     }

//     console.log("\n✅ Theme Seeding Completed for ALL TENANT DATABASES!");
//     process.exit(0);
//   } catch (error) {
//     console.error("\n❌ Global Theme Seeding Error:", error.message);
//     process.exit(1);
//   }
// };

// seedThemeForAllTenantDBs();
// seedThemes.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ThemeModel from '../themeModel.js'; // your model file
import { themeTemplates } from './themeSeedData.js';

dotenv.config();

const seedThemeForAllTenants = async () => {
  try {
    // Connect to admin DB first
    await mongoose.connect(process.env.MONGODB_URL, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('Connected to MongoDB');

    const admin = mongoose.connection.getClient().db().admin();
    const { databases } = await admin.listDatabases();

    const tenantDbs = databases
      .map(db => db.name)
      .filter(name => name.startsWith('mydatabase') && name.endsWith('_DB'));

    if (!tenantDbs.length) {
      console.log('No tenant databases found.');
      process.exit(0);
    }

    console.log(`Found ${tenantDbs.length} tenant DBs`);

    for (const dbName of tenantDbs) {
      console.log(`\nSeeding → ${dbName}`);

      const tenantId = dbName.replace('mydatabase', '').replace('_DB', '');
      const Theme = await ThemeModel(tenantId);

      for (const template of themeTemplates) {
        try {
          // Use findOneAndUpdate → upsert + overwrite
          await Theme.findOneAndUpdate(
            { template_id: template.template_id },
            template,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          console.log(`   ✓ ${template.template_name} saved/updated`);
        } catch (err) {
          if (err.code === 11000) {
            console.log(`   → Duplicate skipped: ${template.template_id}`);
          } else {
            console.error(`   ✗ Error for ${template.template_id}:`, err.message);
          }
        }
      }

      const count = await Theme.countDocuments();
      console.log(`   Total themes now: ${count}`);
    }

    console.log('\nAll tenants seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedThemeForAllTenants();