// routes/user.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

// Protected route
router.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 68dd185a62298a06d63307dd
 *                 name:
 *                   type: string
 *                   example: Admin User
 *                 email:
 *                   type: string
 *                   example: admin@example.com
 *                 role:
 *                   type: string
 *                   example: admin
 *       401:
 *         description: Unauthorized - No token or invalid token
 */
