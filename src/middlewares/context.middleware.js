import crypto from "crypto";
import { requestContext } from "../middlewares/requestContext";

export const contextMiddleware = (req, res, next) => {
  requestContext.run(
    {
      userId: req.user?._id || null,
      role: req.user?.user_role || "guest",
      email: req.user?.email || null,
      name: req.user?.name || "guest",
      requestId: req.headers["x-request-id"] || crypto.randomUUID(),
    },
    () => next()
  );
};
