// routes/user.js
// User-related endpoints (protected). Example: get the logged-in user's profile.
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

// GET /profile - return the profile for the authenticated user
// Requires: Authorization: Bearer <token>
router.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;
 