import cron from "node-cron";
import Task from "../models/Task.model.js";
// import { notifyUser } from "../utils/notifyUser.js";

let reminderCronStarted = false;

export const startReminderCron = () => {
  if (reminderCronStarted) return;

  cron.schedule(
    "*/1 * * * *", // every minute
    async () => {
      console.log("⏰ [CRON] Checking pending task reminders...");

      try {
        const now = new Date();

        const tasks = await Task.find({
          reminderAt: { $lte: now },
          status: "pending",
        }).populate("assignedTo", "_id email name");

        if (!tasks.length) {
          console.log("✅ [CRON] No reminders to send");
          return;
        }

        for (const task of tasks) {
          // 🔔 Send notification
          await notifyUser(task.assignedTo, task.title);

          // ❌ Prevent duplicate alerts
          task.reminderAt = null;
          await task.save();
        }

        console.log(`🔔 [CRON] Sent ${tasks.length} reminders`);
      } catch (err) {
        console.error("❌ [CRON] Reminder cron failed:", err.message);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );

  reminderCronStarted = true;
  console.log("[CRON] Task reminder cron started");
};
