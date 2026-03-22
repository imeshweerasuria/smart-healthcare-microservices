const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../../../shared/config/db");
const doctorRoutes = require("./routes/doctor.routes");
const prescriptionRoutes = require("./routes/prescription.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB(process.env.MONGO_URI);

// Health Check Route
app.get("/health", (req, res) =>
  res.json({ service: "doctor-service", ok: true })
);

// Doctor Routes
app.use("/doctors", doctorRoutes);
app.use("/prescriptions", prescriptionRoutes);

// Server Port
const PORT = process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`doctor-service running on :${PORT}`);
});