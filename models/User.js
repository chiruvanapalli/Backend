const mongoose = require("mongoose");

// User model
// Fields:
// - name: user display name
// - email: unique identifier for login
// - password: hashed password (never return in responses)
// - role: 'user' or 'admin' (used for authorization)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // allowed values
      default: "user", // default role for new users
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
