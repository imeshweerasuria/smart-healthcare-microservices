const express = require("express");
const cors = require("cors");
require("dotenv").config();

const teleRoutes = require("./routes/tele.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/health", (req, res) =>
  res.json({ service: "telemedicine-service", ok: true })
);

// Telemedicine Routes
app.use("/telemedicine", teleRoutes);

// Server Port
const PORT = process.env.PORT || 4005;

app.listen(PORT, () => {
  console.log(`telemedicine-service running on :${PORT}`);
});