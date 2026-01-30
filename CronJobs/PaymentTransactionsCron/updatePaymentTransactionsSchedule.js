import cron from "node-cron";
import { updatePaymentTransactionsCronService } from "./updatePaymentTransactionsCron.js";

cron.schedule("* */10 * * * *", async () => {
  console.log("🕑 Payment transactions update started");

  try {
    await updatePaymentTransactionsCronService();
    // console.log("✅ Payment transactions update finished");
  } catch (err) {
    console.error("❌ Payment transactions update error", err);
  }
});
