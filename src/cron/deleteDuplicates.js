import cron from "node-cron";
import Email from "#models/Email.model.js";

let cronStarted = false;

export const startDeleteDuplicatesCron = () => {
  // 🔒 Guard 1: production only
  if (process.env.NODE_ENV !== "production") {
    console.log("[CRON] deleteDuplicates disabled (non-production)");
    return;
  }

  // 🔒 Guard 2: prevent duplicate scheduling
  if (cronStarted) {
    console.warn("[CRON] deleteDuplicates already running");
    return;
  }

  // ✅ Runs every day at midnight UTC
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("🧹 [CRON] Checking for duplicate leads...");

      try {
        const leads = await Email.find({}, { email: 1, phoneNumber: 1 });

        const seen = new Set();
        const duplicates = [];

        for (const lead of leads) {
          const key = `${lead.email || ""}-${lead.phoneNumber || ""}`.trim();

          if (!key) continue;

          if (seen.has(key)) {
            duplicates.push(lead._id);
          } else {
            seen.add(key);
          }
        }

        if (duplicates.length > 0) {
          const result = await Email.deleteMany({
            _id: { $in: duplicates },
          });

          console.log(
            `🗑️ [CRON] Deleted ${result.deletedCount} duplicate leads`
          );
        } else {
          console.log("✅ [CRON] No duplicate leads found");
        }
      } catch (err) {
        console.error("❌ [CRON] deleteDuplicates failed:", err.message);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );

  cronStarted = true;
  console.log("[CRON] deleteDuplicates started");
};
