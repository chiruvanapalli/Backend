// middleware/admin.js
// Authorization middleware that ensures the authenticated user has the
// 'admin' role. This middleware expects `auth` (JWT verification) to run
// earlier so that `req.user.id` is available.
const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  // Read current role from DB to ensure immediate revocation if role changed.
  const user = await User.findById(req.user.id);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = adminMiddleware;
