import winston from "winston";
import "winston-daily-rotate-file";
import config from "../config/config.js";

const { createLogger, format, transports } = winston;

const transportsList = [];

// Always log to console
if (config.logging.toConsole) {
  transportsList.push(
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
      ),
    })
  );
}

// Only write .txt files locally
if (config.logging.toFile) {
  transportsList.push(
    new transports.DailyRotateFile({
      filename: `${config.logging.directory}/%DATE%-combined.txt`,
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "14d",
      zippedArchive: config.logging.compress,
      format: format.combine(format.timestamp(), format.json()),
    })
  );
}

const logger = createLogger({
  level: config.logging.level,
  transports: transportsList,
});

export default logger;
