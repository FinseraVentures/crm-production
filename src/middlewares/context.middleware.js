// src/middlewares/context.middleware.js
import crypto from "crypto";
import { requestContext } from "./requestContext.js";

export const contextMiddleware = (req, res, next) => {
  requestContext.run(
    {
      requestId: req.headers["x-request-id"] || crypto.randomUUID(),

      // User identity
      userId: req.user?._id || null,
      role: req.user?.user_role || "guest",
      email: req.user?.email || null,
      name: req.user?.name || "guest",
      companyId: req.user?.company || null,
    },
    () => next(),
  );
};
