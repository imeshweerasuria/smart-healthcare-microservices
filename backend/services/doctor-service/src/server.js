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

// Health Check Route
app.get("/health", (req, res) =>
  res.json({ service: "doctor-service", ok: true })
);

// Doctor Routes
app.use("/doctors", doctorRoutes);
app.use("/prescriptions", prescriptionRoutes);

const PORT = process.env.PORT || 4003;

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`doctor-service running on :${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start doctor-service:", err);
    process.exit(1);
  }
}

startServer();