const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("../../../shared/config/mongoose");
const connectDB = require("../../../shared/config/db");
const authRoutes = require("./routes/auth.routes");
const noticeRoutes = require("./routes/notice.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({
    service: "auth-service",
    ok: true,
    mongooseState: mongoose.connection.readyState,
  });
});

// Auth routes
app.use("/auth", authRoutes);
app.use("/notices", noticeRoutes);

const PORT = process.env.PORT || 4001;

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Auth-service Mongo readyState:", mongoose.connection.readyState);

    app.listen(PORT, () => {
      console.log(`auth-service running on :${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start auth-service:", err);
    process.exit(1);
  }
}

startServer();