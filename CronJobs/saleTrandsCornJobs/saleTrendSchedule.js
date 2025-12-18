import cron from "node-cron";
import { deactivateExpiredSaleTrendsService } from "./saleTrend.cron.js";
import { getTenantDatabases } from "../CornUtils/getTenantDatabases.js";
import { mongoUri } from "../../env.js";

// Run every hour at minute 0
cron.schedule("0 12 * * *", async () => {
    console.log("🕑 Sale trend deactivation task started");

    try {
        const tenantDbs = await getTenantDatabases();

        // Extract base DB name from URI (e.g. "mydatabase")
        const baseDbPath = mongoUri.split("?")[0].split("/");
        const baseDbName = baseDbPath[baseDbPath.length - 1];

        for (const dbName of tenantDbs) {
            let tenantId = dbName.replace(/_DB$/, "");

            // Remove the base name prefix if present
            if (baseDbName && tenantId.startsWith(baseDbName)) {
                tenantId = tenantId.slice(baseDbName.length);
            }

            console.log(`➡ Checking trends for Tenant ID: ${tenantId} (from DB: ${dbName})`);
            await deactivateExpiredSaleTrendsService(tenantId);
        }

        console.log("✅ Sale trend deactivation task finished");
    } catch (err) {
        console.error("❌ Sale trend deactivation task error:", err);
    }
});
