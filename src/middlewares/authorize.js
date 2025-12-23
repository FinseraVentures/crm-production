// middlewares/authorize.js
import { ROLE_PERMISSIONS } from "../rbac/rolePermissions.js";

export const authorize = (permission) => {
  return (req, res, next) => {
    const role = req.user?.user_role;

    if (!role) {
      return res.status(403).json({ message: "Role missing" });
    }

    const permissions = ROLE_PERMISSIONS[role] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
