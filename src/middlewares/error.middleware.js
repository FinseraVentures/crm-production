import errorLogger from "../logger/errorLogger.js";

export default (err, req, res, next) => {
  errorLogger.error({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
