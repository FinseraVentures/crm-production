import errorLogger from "../logger/errorLogger.js";
import { requestContext } from "../middlewares/requestContext.js";

export default (err, req, res, next) => {
  const context = requestContext.getStore() || {};

  errorLogger.error({
    message: err.message,
    stack: err.stack,

    // Request info
    route: req.originalUrl,
    method: req.method,

    //  Context (SaaS critical)
    requestId: context.requestId || null,
    userId: context.userId || null,
    companyId: context.companyId || null,
    role: context.role || null,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
