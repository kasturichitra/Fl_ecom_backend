import cron from "node-cron";
import { aggregateProductReviewsService } from "./reviewsCron.js";
import { getTenantDatabases } from "./CornUtils/getTenantDatabases.js";


import { mongoUri } from "../env.js";


// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
    console.log("🕑 Review aggregation started");

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
            await aggregateProductReviewsService(tenantId);
        }

        console.log("✅ Review aggregation finished");
    } catch (err) {
        console.error("❌ Review aggregation error", err);
    }
});
