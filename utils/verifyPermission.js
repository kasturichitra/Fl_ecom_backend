/**
 * Authorization Middleware
 *
 * Checks if the authenticated user has the required permission(s).
 * Permissions are fetched and attached to req.user by verifyToken middleware.
 *
 * Usage:
 *   verifyPermission("product:create")           // Single permission
 *   verifyPermission(["product:read", "order:read"])  // Multiple permissions (OR logic)
 *
 * @param {string|string[]} requiredPermissions - Permission key(s) to check
 * @returns {Function} Express middleware function
 */
const verifyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          status: "failed",
          message: "Authentication required",
        });
      }

      // Get user's permissions from req.user (populated by verifyToken)
      const userPermissions = req.user.permissions || [];

      // Convert to array if single permission provided
      const requiredPerms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

      // Check if user has at least one of the required permissions (OR logic)
      const hasPermission = requiredPerms.some((perm) => userPermissions.includes(perm));

      if (!hasPermission) {
        return res.status(403).json({
          status: "failed",
          message: "You are not permitted for this operation",
          // required: requiredPerms,
          // current: userPermissions,
        });
      }

      // User has required permission, proceed
      next();
    } catch (error) {
      console.error("Authorization error:", error.message);
      return res.status(500).json({
        status: "failed",
        message: "Authorization check failed",
      });
    }
  };
};

export default verifyPermission;
