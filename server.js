// server.js
// Simple Express server for the authentication example project.
// Responsibilities:
//  - Load environment variables from .env
//  - Connect to MongoDB
//  - Register route handlers under /api/*
// Keep this file minimal; route logic lives in `routes/` and middleware in `middleware/`.
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const authRoute = require("./routes/auth");
const swaggerSpec = require("./swagger");

// Load .env (database URL, JWT secret, etc.)
dotenv.config();

const app = express();
// Allow cross-origin requests from frontend during development
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true, // allow cookies
  })
);
// Webhook endpoint requires raw body for signature verification.
// Register webhook route BEFORE the JSON body parser to preserve raw body.
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  require("./routes/webhooks")
);

// Parse JSON bodies for all other incoming requests
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB connection (single connection for the app)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/auth", authRoute);
app.use("/api", require("./routes/public"));
app.use("/api/user", require("./routes/user"));
app.use("/api/admin", require("./routes/admin"));
// E-commerce related routes
app.use("/api/cart", require("./routes/cart"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/address", require("./routes/address"));
app.use("/api", require("./routes/popularproducts"));
app.use("/api", require("./routes/products"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
