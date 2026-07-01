const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");



const app = express();
const connectDB = require("./config/db");

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Routes ----------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "HRMS API is running" });
});

// ---------- Temp Test Routes (remove later) ----------
const auth = require("./middleware/authMiddleware");
const checkRole = require("./middleware/roleMiddleware");

// Test 1: Any logged-in user can access
app.get("/api/test/protected", auth, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

// Test 2: Only superadmin & admin can access
app.get("/api/test/admin-only", auth, checkRole(["superadmin", "admin"]), (req, res) => {
  res.json({ message: "Welcome, Admin!", user: req.user });
});
// ---------- End Temp Test Routes ----------



// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);

  // Malformed JSON in request body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body.",
    });
  }

  const statusCode = Number(err.status) || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error.",
  });
});

// ---------- Start Server (only after DB connects) ----------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
