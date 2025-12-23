import cron from "node-cron";
import { checkAndExpireCouponsService } from "./couponExpiry.cron.js";
import { getTenantDatabases } from "../CornUtils/getTenantDatabases.js";
import { mongoUri } from "../../env.js";

// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
    console.log("🕑 Coupon expiry check started");

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

            //console.log(`➡ Processing Tenant ID: ${tenantId} (from DB: ${dbName})`);
            await checkAndExpireCouponsService(tenantId);
        }

        console.log("✅ Coupon expiry check finished");
    } catch (err) {
        console.error("❌ Coupon expiry check error", err);
    }
});
