const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../../../shared/config/db");
const payRoutes = require("./routes/payment.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB(process.env.MONGO_URI);

// Health check route
app.get("/health", (req, res) => {
  res.json({ service: "payment-service", ok: true });
});

// Payment routes
app.use("/payments", payRoutes);

// Server start
const PORT = process.env.PORT || 4007;
app.listen(PORT, () => {
  console.log(`payment-service running on :${PORT}`);
});