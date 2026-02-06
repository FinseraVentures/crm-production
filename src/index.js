// src/index.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import app from "./app.js";
import { connection } from "./db/config.js";
import logger from "./logger/index.js";
import errorLogger from "./logger/errorLogger.js";
import config from "./config/config.js";
import { startKeepAliveCron } from "./cron/serverRunningUp.js";
import { startDeleteDuplicatesCron } from "./cron/deleteDuplicates.js";

app.use(cors());

const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow only these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization", "user-role"], // Allow only these headers
  credentials: true, // Allow cookies to be included in the requests
};
app.use(cors(corsOptions));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env FIRST
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// Process errors
process.on("uncaughtException", (err) => {
  errorLogger.error("Uncaught Exception", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  errorLogger.error("Unhandled Rejection", reason);
});

const startServer = async () => {
  try {
    await connection();
    logger.info("✅ Database connected");

    app.listen(config.server.port, () => {
      logger.info(`🚀 Server running on port ${config.server.port}`);

      if (config.isProd && process.env.KEEP_ALIVE_URL) {
        startKeepAliveCron();
        startDeleteDuplicatesCron();
      }
    });
  } catch (err) {
    logger.error("❌ Failed to start server", err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { startServer };
