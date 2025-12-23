
const ROLE_PERMISSIONS = {
  srdev: [
    'booking:create',
    'booking:delete',
    'booking:view_all',
    'employee:approve',
  ],
  admin: [
    'booking:create',
    'booking:view_all',
  ],
  HR: [
    'employee:approve',
  ],
};



export const authorize = (permission) => {
  return (req, res, next) => {
    const role = req.user.user_role;
    const permissions = ROLE_PERMISSIONS[role] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
