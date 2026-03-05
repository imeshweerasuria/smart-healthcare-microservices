const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../../../shared/config/db");
const apptRoutes = require("./routes/appointment.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB(process.env.MONGO_URI);

// Health check route
app.get("/health", (req, res) => {
  res.json({ service: "appointment-service", ok: true });
});

// Appointment routes
app.use("/appointments", apptRoutes);

// Server start
const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`appointment-service running on :${PORT}`);
});