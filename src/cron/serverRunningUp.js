import cron from "node-cron";

const isProd = process.env.NODE_ENV === "production";
const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL;

let cronStarted = false;

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
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

        const res = await fetch(KEEP_ALIVE_URL, {
          signal: controller.signal,
        });

        clearTimeout(timeout);

        console.log(
          `[CRON] Keep-alive OK ${res.status} @ ${new Date().toISOString()}`
        );
      } catch (err) {
        // ❗ Never throw from cron
        console.error("[CRON] Keep-alive failed:", err.message);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );

  cronStarted = true;
  console.log("[CRON] Keep-alive started (production)");
};
