const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../../../shared/config/db");
const patientRoutes = require("./routes/patient.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ service: "patient-service", ok: true })
);

// Patient routes
app.use("/patients", patientRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 4002;

async function startServer() {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`patient-service running on :${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start patient-service:", err);
    process.exit(1);
  }
}

startServer();