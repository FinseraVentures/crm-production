export const tenantGuard = (req, res, next) => {
  if (!req.user?.companyId) return next(); // internal user
  req.tenant = req.user.companyId;
  next();
};
