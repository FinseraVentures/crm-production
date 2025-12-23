import winston from "winston";
import "winston-daily-rotate-file";

const { createLogger, format, transports } = winston;

const errorRotate = new transports.DailyRotateFile({
  filename: "logs/%DATE%-error.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "10m",
  maxFiles: "30d",
});

const errorLogger = createLogger({
  level: "error",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [new transports.Console(), errorRotate],
});

export default errorLogger;
