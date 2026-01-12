import winston from "winston";
import "winston-daily-rotate-file";
import config from "../config/config.js";
import { requestContext } from "../middlewares/requestContext.js";

const { createLogger, format, transports } = winston;

// 🔹 Inject request/user context into every log
const addContext = format((info) => {
  const store = requestContext.getStore();

  if (store) {
    info.userId = store.userId;
    info.role = store.role;
    info.email = store.email;
    info.requestId = store.requestId;
    info.name = store.name;
  }

  return info;
});

const baseFormat = format.combine(
  addContext(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat()
);

const transportsList = [];

// Console logging
if (config.logging.toConsole) {
  transportsList.push(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        baseFormat,
        format.printf(
          ({
            timestamp,
            level,
            message,
            email,
            stack,
            userId,
            name,
            requestId,
          }) => {
            const meta = requestId
              ? `[user:${email || "anon"}|[name:${name}]]`
              : "";

            return stack
              ? `${level}${meta} ${stack}`
              : `${level}${meta} ${message}`;
          }
        )
      ),
    })
  );
}

// File logging (JSON only)
if (config.logging.toFile) {
  transportsList.push(
    new transports.DailyRotateFile({
      filename: `${config.logging.directory}/%DATE%-combined.log`,
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "14d",
      zippedArchive: config.logging.compress,
      format: format.combine(baseFormat, format.json()),
    })
  );
}

const logger = createLogger({
  level: config.logging.level || "info",
  defaultMeta: {
    service: config.appName || "backend-service",
    env: config.env || "development",
  },
  transports: transportsList,
  exceptionHandlers: transportsList,
  rejectionHandlers: transportsList,
});

export default logger;
