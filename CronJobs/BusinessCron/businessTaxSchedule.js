import cron from "node-cron";
import { getTenantDatabases } from "../CornUtils/getTenantDatabases.js";
import { aggregateBusinessTaxService } from "./businessTaxAggregation.cron.js";
import { mongoUri } from "../../env.js";

// Run every week on Sunday at 3 AM
cron.schedule("21 16 * * *", async () => {
    console.log("🕑 Weekly Business Tax Aggregation started");

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

            console.log(`➡ Processing Business Tax for Tenant ID: ${tenantId} (from DB: ${dbName})`);
            await aggregateBusinessTaxService(tenantId);
        }

        console.log("✅ Weekly Business Tax Aggregation finished");
    } catch (err) {
        console.error("❌ Weekly Business Tax Aggregation error", err);
    }
});
