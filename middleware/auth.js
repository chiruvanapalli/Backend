// middleware/auth.js
// Authentication middleware that verifies a JWT provided in the
// Authorization header and attaches the decoded payload to `req.user`.
// Expected header: Authorization: Bearer <token>
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Support missing header gracefully
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    // decoded object will contain the payload used when signing the token
    // e.g. { id: user._id, role?: 'admin' }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach to request for downstream handlers
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
