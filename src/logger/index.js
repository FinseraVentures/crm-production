import winston from "winston";
import "winston-daily-rotate-file";
import config from "../config/config.js";

const { createLogger, format, transports } = winston;

const baseFormat = format.combine(
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
        format.printf(({ timestamp, level, message, stack }) => {
          return stack
            ? `[${timestamp}] ${level}: ${stack}`
            : `[${timestamp}] ${level}: ${message}`;
        })
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
