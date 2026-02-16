// middlewares/authorize.js
import { ROLE_PERMISSIONS } from "../rbac/rolePermissions.js";

export const authorize = (permission) => {
  return (req, res, next) => {
    const role = req.user?.user_role;

    if (!role) {
      return res.status(403).json({
        success: false,
        message: "Role missing",
      });
    }

    // 🔒 Block non-admin users without company
    if (!req.user.company && role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Company not assigned",
      });
    }

    const permissions = ROLE_PERMISSIONS[role] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
