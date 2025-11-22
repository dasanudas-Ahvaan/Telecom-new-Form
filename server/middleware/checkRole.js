// server/middleware/checkRole.js

/**
 * Middleware to check if the logged-in admin has one of the allowed roles.
 * Must be used *after* authMiddleware.
 * @param {string[]} allowedRoles - An array of allowed roles (e.g., ['Owner'])
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // authMiddleware should have already run and attached req.admin
    if (!req.admin || !req.admin.role) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication error: Admin details not found.' 
      });
    }

    const hasPermission = allowedRoles.includes(req.admin.role);

    if (!hasPermission) {
      return res.status(403).json({ // 403 Forbidden
        success: false, 
        message: 'Access denied: You do not have permission for this action.' 
      });
    }

    // User has the correct role, proceed to the controller
    next();
  };
};

export default checkRole;