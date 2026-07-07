export default function roleMiddleware(roles = []) {
  return (req, _res, next) => {
    if (!req.user) {
      return next({ status: 401, message: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next({ status: 403, message: 'Forbidden: insufficient permissions' });
    }

    next();
  };
}