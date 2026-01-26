import cron from "node-cron";

const isProd = process.env.NODE_ENV === "production";
const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL;

let cronStarted = false;

/**
 * Allowed keep-alive window:
 * 09:30 AM → 07:00 PM (IST)
 */
const isWithinActiveHours = () => {
  const now = new Date();

  // Convert to IST
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );

  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();

  // Before 09:30 AM
  if (hours < 9 || (hours === 9 && minutes < 30)) return false;

  // After 07:00 PM
  if (hours >= 19) return false;

  return true;
};

export const startKeepAliveCron = () => {
  // 🔒 Guard 1: Only production
  if (!isProd) {
    console.log("[CRON] Keep-alive disabled (non-production)");
    return;
  }

  // 🔒 Guard 2: URL must exist
  if (!KEEP_ALIVE_URL) {
    console.warn("[CRON] KEEP_ALIVE_URL not set, skipping keep-alive cron");
    return;
  }

  // 🔒 Guard 3: Prevent duplicate cron start
  if (cronStarted) {
    console.warn("[CRON] Keep-alive already running, skipping duplicate start");
    return;
  }

  cron.schedule(
    "*/13 * * * *",
    async () => {
      // 🕒 Guard 4: Skip during off-hours
      if (!isWithinActiveHours()) {
        console.log("[CRON] Skipped (off-hours IST)");
        return;
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);

        const res = await fetch(KEEP_ALIVE_URL, {
          signal: controller.signal,
        });

        clearTimeout(timeout);

        console.log(
          `[CRON] Keep-alive OK ${res.status} @ ${new Date().toISOString()}`,
        );
      } catch (err) {
        // ❗ Never throw from cron
        console.error("[CRON] Keep-alive failed:", err.message);
      }
    },
    {
      scheduled: true,
      timezone: "UTC", // cron timing stays UTC; logic uses IST
    },
  );

  cronStarted = true;
  console.log("[CRON] Keep-alive started (production, time-guarded)");
};
