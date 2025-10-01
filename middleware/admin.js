// middleware/admin.js
const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = adminMiddleware;
