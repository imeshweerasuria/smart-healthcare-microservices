const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../../../shared/config/db");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({ service: "auth-service", ok: true });
});

// Auth routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4001;

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`auth-service running on :${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start auth-service:", err);
    process.exit(1);
  }
}

startServer();