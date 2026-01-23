import cron from "node-cron";

import { deletePendingOrdersCronService } from "./deletePendingOrders.cron.js";
import { getTenantDatabases } from "../CornUtils/getTenantDatabases.js";
import { mongoUri } from "../../env.js";

// Run daily at 2:45 AM
cron.schedule("45 2 * * *", async () => {
  console.log("🕑 Pending order deletion started");

  try {
    const tenantDbs = await getTenantDatabases();

    // Extract base DB name from URI (e.g. "mydatabase")
    const baseDbName = mongoUri.split("?")[0].split("/").pop();

    for (const dbName of tenantDbs) {
      let tenantId = dbName.replace(/_DB$/, "");

      // Remove the base name prefix if present
      if (baseDbName && tenantId.startsWith(baseDbName)) {
        tenantId = tenantId.slice(baseDbName.length);
      }

      console.log(`➡ Processing Tenant ID: ${tenantId} (from DB: ${dbName})`);
      await deletePendingOrdersCronService(tenantId);
    }

    console.log("✅ Pending order deletion finished");
  } catch (error) {
    console.error("❌ Pending order deletion error", error);
  }
});
